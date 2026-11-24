import { z } from 'zod';
import { pool, transaction } from './db.js';
import { AppError, parseInput } from './errors.js';

const profilePatchSchema = z.object({
	displayName: z.string().trim().min(1).max(80).optional(),
	bio: z.string().max(500).nullable().optional(),
	locationText: z.string().max(120).nullable().optional(),
	websiteUrl: z.union([z.string().url().max(2048), z.null()]).optional(),
	avatarMediaId: z.union([z.string().uuid(), z.null()]).optional(),
	privacy: z.enum(['public', 'private']).optional()
}).strict().refine((value) => Object.keys(value).length > 0, 'Cần có ít nhất một trường để cập nhật.');

type ProfileRow = Record<string, unknown>;

function asMyProfile(row: ProfileRow) {
	return {
		id: row.id as string,
		email: row.email_normalized as string,
		username: row.username as string,
		displayName: row.display_name as string,
		bio: (row.bio as string | null) ?? null,
		avatarMediaId: (row.avatar_media_id as string | null) ?? null,
		avatarUrl: row.avatar_media_id ? `/api/v1/media/${row.avatar_media_id}/content` : null,
		createdAt: row.created_at as Date,
		privacy: row.privacy as 'public' | 'private',
		locationText: (row.location_text as string | null) ?? null,
		websiteUrl: (row.website_url as string | null) ?? null,
		emailVerifiedAt: (row.email_verified_at as Date | null) ?? null
	};
}

function asPublicProfile(row: ProfileRow) {
	return {
		id: row.id as string,
		username: row.username as string,
		displayName: row.display_name as string,
		bio: (row.bio as string | null) ?? null,
		avatarUrl: row.avatar_media_id ? `/api/v1/media/${row.avatar_media_id}/content` : null,
		createdAt: row.created_at as Date
	};
}

const profileSelect = `
	SELECT u.id, u.email_normalized, u.username, u.display_name, u.bio,
	       u.avatar_media_id, u.created_at, u.email_verified_at,
	       p.privacy, p.location_text, p.website_url
	FROM users u JOIN user_profiles p ON p.user_id = u.id`;

export async function getMyProfile(userId: string) {
	const result = await pool.query<ProfileRow>(`${profileSelect} WHERE u.id = $1 AND u.deleted_at IS NULL`, [userId]);
	if (!result.rows[0]) throw new AppError(404, 'Không tìm thấy hồ sơ', 'Hồ sơ không còn tồn tại.');
	return asMyProfile(result.rows[0]);
}

export async function getPublicProfile(usernameInput: string) {
	const username = usernameInput.trim().toLowerCase();
	const result = await pool.query<ProfileRow>(
		`${profileSelect} WHERE lower(u.username) = $1 AND u.status = 'active' AND u.deleted_at IS NULL AND p.privacy = 'public'`,
		[username]
	);
	if (!result.rows[0]) throw new AppError(404, 'Không tìm thấy hồ sơ', 'Hồ sơ không tồn tại hoặc không công khai.');
	return asPublicProfile(result.rows[0]);
}

export async function patchMyProfile(userId: string, input: unknown) {
	const data = parseInput(profilePatchSchema, input);
	return transaction(async (client) => {
		if (data.avatarMediaId) {
			const media = await client.query(
				`SELECT 1 FROM media_assets WHERE id = $1 AND owner_id = $2 AND status = 'ready'`,
				[data.avatarMediaId, userId]
			);
			if (!media.rowCount) throw new AppError(422, 'Ảnh đại diện không hợp lệ', 'Chỉ dùng ảnh đã xử lý thuộc tài khoản của bạn.');
		}

		const userSets: string[] = [];
		const userValues: unknown[] = [];
		const userFields = [
			['displayName', 'display_name'],
			['bio', 'bio'],
			['avatarMediaId', 'avatar_media_id']
		] as const;
		for (const [inputKey, column] of userFields) {
			if (Object.hasOwn(data, inputKey)) {
				userValues.push(data[inputKey]);
				userSets.push(`${column} = $${userValues.length}`);
			}
		}
		if (userSets.length) {
			userValues.push(userId);
			await client.query(`UPDATE users SET ${userSets.join(', ')}, updated_at = now() WHERE id = $${userValues.length}`, userValues);
		}

		const profileSets: string[] = [];
		const profileValues: unknown[] = [];
		const profileFields = [
			['locationText', 'location_text'],
			['websiteUrl', 'website_url'],
			['privacy', 'privacy']
		] as const;
		for (const [inputKey, column] of profileFields) {
			if (Object.hasOwn(data, inputKey)) {
				profileValues.push(data[inputKey]);
				profileSets.push(`${column} = $${profileValues.length}`);
			}
		}
		if (profileSets.length) {
			profileValues.push(userId);
			await client.query(`UPDATE user_profiles SET ${profileSets.join(', ')} WHERE user_id = $${profileValues.length}`, profileValues);
		}

		const result = await client.query<ProfileRow>(`${profileSelect} WHERE u.id = $1`, [userId]);
		if (!result.rows[0]) throw new AppError(404, 'Không tìm thấy hồ sơ', 'Hồ sơ không còn tồn tại.');
		return asMyProfile(result.rows[0]);
	});
}
