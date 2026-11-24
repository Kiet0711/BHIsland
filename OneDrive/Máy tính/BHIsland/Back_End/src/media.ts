import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { config } from './config.js';
import { pool, transaction } from './db.js';
import { AppError, parseInput } from './errors.js';

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
const intentSchema = z.object({
	filename: z.string().trim().min(1).max(200),
	mimeType: z.enum(mimeTypes),
	byteSize: z.number().int().min(1).max(MAX_BYTES),
	checksum: z.string().regex(/^[a-f0-9]{64}$/i).optional()
}).strict();

const baseDir = config.mediaDirectory ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../.local-data/uploads');
const allowedMime = new Set<string>(mimeTypes);

function assetPath(storageKey: string): string {
	if (!/^(pending\/[0-9a-f-]{36}\.upload|ready\/[0-9a-f-]{36}\.webp)$/i.test(storageKey)) {
		throw new Error('Unexpected media storage key.');
	}
	const path = resolve(baseDir, storageKey);
	if (!path.startsWith(`${resolve(baseDir)}\\`) && !path.startsWith(`${resolve(baseDir)}/`)) {
		throw new Error('Media path escaped its storage directory.');
	}
	return path;
}

function sha256(data: Uint8Array): Buffer {
	return createHash('sha256').update(data).digest();
}

export async function createUploadIntent(userId: string, input: unknown) {
	if (config.nodeEnv === 'production') throw new AppError(503, 'Chưa cấu hình media storage', 'Cần cấu hình object storage production trước khi bật upload.');
	const data = parseInput(intentSchema, input);
	const id = randomUUID();
	const key = `pending/${id}.upload`;
	await pool.query(
		`INSERT INTO media_assets(id, owner_id, storage_key, mime_type, byte_size, checksum, status)
		 VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
		[id, userId, key, data.mimeType, data.byteSize, data.checksum?.toLowerCase() ?? null]
	);
	const origin = config.publicOrigin.replace(/\/$/, '');
	return {
		mediaId: id,
		uploadUrl: `${origin}/api/v1/media/${id}/upload`,
		method: 'PUT' as const,
		headers: { 'Content-Type': data.mimeType },
		expiresAt: new Date(Date.now() + 15 * 60 * 1000)
	};
}

export async function uploadPendingMedia(userId: string, mediaId: string, contentType: string | null, bytes: Uint8Array): Promise<void> {
	if (bytes.byteLength > MAX_BYTES) throw new AppError(413, 'Tệp quá lớn', 'Ảnh không được vượt quá 15 MB.');
	const result = await pool.query<{ storage_key: string; mime_type: string; byte_size: string; status: string }>(
		`SELECT storage_key, mime_type, byte_size, status FROM media_assets WHERE id = $1 AND owner_id = $2`,
		[mediaId, userId]
	);
	const media = result.rows[0];
	if (!media) throw new AppError(404, 'Không tìm thấy media', 'Tệp không tồn tại hoặc không thuộc tài khoản của bạn.');
	if (media.status !== 'pending') throw new AppError(409, 'Trạng thái upload không hợp lệ', 'Upload chỉ được thực hiện cho media đang chờ.');
	if (!allowedMime.has(media.mime_type) || contentType?.split(';')[0]?.trim().toLowerCase() !== media.mime_type) {
		throw new AppError(422, 'Loại ảnh không hợp lệ', 'Content-Type phải khớp loại ảnh đã đăng ký.');
	}
	if (bytes.byteLength !== Number(media.byte_size)) throw new AppError(422, 'Kích thước ảnh không khớp', 'Kích thước upload phải khớp upload intent.');
	await mkdir(dirname(assetPath(media.storage_key)), { recursive: true });
	try {
		await writeFile(assetPath(media.storage_key), bytes, { flag: 'wx', mode: 0o600 });
	} catch (error) {
		if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST') {
			throw new AppError(409, 'Upload đã tồn tại', 'Tạo upload intent mới để thử lại.');
		}
		throw error;
	}
}

export async function completeUpload(userId: string, mediaId: string) {
	const media = await transaction(async (client) => {
		const result = await client.query<{ id: string; storage_key: string; mime_type: string; byte_size: string; checksum: string | null }>(
			`UPDATE media_assets SET status = 'processing'
			 WHERE id = $1 AND owner_id = $2 AND status = 'pending'
			 RETURNING id, storage_key, mime_type, byte_size, checksum`, [mediaId, userId]
		);
		if (!result.rows[0]) {
			const owned = await client.query('SELECT 1 FROM media_assets WHERE id = $1 AND owner_id = $2', [mediaId, userId]);
			if (!owned.rowCount) throw new AppError(404, 'Không tìm thấy media', 'Tệp không tồn tại hoặc không thuộc tài khoản của bạn.');
			throw new AppError(409, 'Trạng thái upload không hợp lệ', 'Tệp chưa được upload hoặc đã được xử lý.');
		}
		return result.rows[0]!;
	});

	const inputPath = assetPath(media.storage_key);
	let outputPath: string | null = null;
	try {
		const input = await readFile(inputPath);
		if (input.byteLength !== Number(media.byte_size)) throw new Error('uploaded size mismatch');
		if (media.checksum) {
			const expected = Buffer.from(media.checksum, 'hex');
			const actual = sha256(input);
			if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error('checksum mismatch');
		}
		const { default: sharp } = await import('sharp');
		const image = sharp(input, { limitInputPixels: MAX_PIXELS, failOn: 'error' });
		const metadata = await image.metadata();
		const observedMime = metadata.format === 'jpeg' ? 'image/jpeg'
			: metadata.format === 'png' ? 'image/png'
			: metadata.format === 'webp' ? 'image/webp'
			: metadata.format === 'heif' ? 'image/avif'
			: null;
		if (!observedMime || observedMime !== media.mime_type) throw new Error('image signature does not match declared type');
		if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_PIXELS) throw new Error('image dimensions exceed limit');

		const { data, info } = await image.rotate().webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true });
		if (data.byteLength > MAX_BYTES) throw new Error('processed image exceeds size limit');
		outputPath = assetPath(`ready/${mediaId}.webp`);
		await mkdir(dirname(outputPath), { recursive: true });
		await writeFile(outputPath, data, { flag: 'wx', mode: 0o600 });
		const checksum = sha256(data).toString('hex');
		await pool.query(
			`UPDATE media_assets SET storage_key = $1, mime_type = 'image/webp', byte_size = $2,
			 width = $3, height = $4, checksum = $5, status = 'ready'
			 WHERE id = $6 AND owner_id = $7 AND status = 'processing'`,
			[`ready/${mediaId}.webp`, data.byteLength, info.width, info.height, checksum, mediaId, userId]
		);
		await rm(inputPath, { force: true });
		return { id: mediaId, status: 'ready' as const, altText: null };
	} catch {
		await pool.query(`UPDATE media_assets SET status = 'rejected' WHERE id = $1 AND owner_id = $2 AND status = 'processing'`, [mediaId, userId]);
		await rm(inputPath, { force: true }).catch(() => undefined);
		if (outputPath) await rm(outputPath, { force: true }).catch(() => undefined);
		throw new AppError(422, 'Không thể xử lý ảnh', 'Tệp không hợp lệ, bị hỏng hoặc vượt giới hạn xử lý.');
	}
}

export async function readMedia(userId: string | null, mediaId: string) {
	const result = await pool.query<{ storage_key: string; mime_type: string; byte_size: string; owner_id: string; public_access: boolean }>(
		`SELECT m.storage_key, m.mime_type, m.byte_size, m.owner_id,
		 (EXISTS (
			SELECT 1 FROM users u JOIN user_profiles p ON p.user_id = u.id
			WHERE u.avatar_media_id = m.id AND p.privacy = 'public' AND u.status = 'active' AND u.deleted_at IS NULL
		 ) OR EXISTS (
			SELECT 1 FROM vehicles v JOIN users u ON u.id = v.owner_id
			WHERE v.cover_media_id = m.id AND v.visibility = 'public' AND v.deleted_at IS NULL AND u.status = 'active' AND u.deleted_at IS NULL
		 )) AS public_access
		 FROM media_assets m WHERE m.id = $1 AND m.status = 'ready'`, [mediaId]
	);
	const media = result.rows[0];
	if (!media || (media.owner_id !== userId && !media.public_access)) throw new AppError(404, 'Không tìm thấy ảnh', 'Ảnh không tồn tại hoặc không hiển thị.');
	const data = await readFile(assetPath(media.storage_key)).catch(() => null);
	if (!data) throw new AppError(404, 'Không tìm thấy ảnh', 'Ảnh không tồn tại hoặc không hiển thị.');
	return { data, contentType: media.mime_type, byteSize: Number(media.byte_size), isPublic: media.public_access };
}
