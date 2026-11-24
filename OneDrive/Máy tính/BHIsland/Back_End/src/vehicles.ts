import { z } from 'zod';
import type { QueryResultRow } from 'pg';
import { pool, transaction } from './db.js';
import { AppError, parseInput } from './errors.js';
import { decodeCursor, encodeCursor } from './security.js';

const primitive = z.union([z.string().max(200), z.number().finite(), z.boolean(), z.null()]);
const attributesSchema = z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/), primitive).refine((value) => Object.keys(value).length <= 12, 'Tối đa 12 thuộc tính.');
const vehicleFields = {
	vehicleType: z.string().regex(/^[a-z0-9-]{1,40}$/),
	title: z.string().trim().min(1).max(120),
	make: z.string().max(80).nullable().optional(),
	model: z.string().max(100).nullable().optional(),
	year: z.number().int().min(1886).max(2100).nullable().optional(),
	description: z.string().max(2000).nullable().optional(),
	attributes: attributesSchema.optional(),
	visibility: z.enum(['public', 'followers', 'private']).optional(),
	coverMediaId: z.string().uuid().nullable().optional()
};
const vehicleCreateSchema = z.object({
	vehicleType: vehicleFields.vehicleType,
	title: vehicleFields.title,
	make: vehicleFields.make,
	model: vehicleFields.model,
	year: vehicleFields.year,
	description: vehicleFields.description,
	attributes: vehicleFields.attributes,
	visibility: vehicleFields.visibility,
	coverMediaId: vehicleFields.coverMediaId
}).strict();
const vehiclePatchSchema = z.object(vehicleFields).strict().refine((value) => Object.keys(value).length > 0, 'Cần có ít nhất một trường để cập nhật.');

const attributeKeys: Record<string, Set<string>> = {
	motorcycle: new Set(['displacementCc', 'engineType', 'color', 'modifications']),
	car: new Set(['bodyStyle', 'fuelType', 'transmission', 'color', 'driveType']),
	bicycle: new Set(['bicycleType', 'frameMaterial', 'frameSize', 'color']),
	truck: new Set(['payloadKg', 'axleCount', 'truckBody', 'fuelType']),
	offroad: new Set(['suspension', 'drivetrain', 'tireSize', 'modifications']),
	electric: new Set(['batteryKwh', 'rangeKm', 'motorPowerKw', 'chargingConnector']),
	classic: new Set(['manufacturingYear', 'origin', 'restorationStatus']),
	other: new Set(['category', 'notes'])
};

type VehicleRow = Record<string, unknown>;
type CursorPage = { limit?: number; cursor?: string | null };
type Queryable = {
	query<T extends QueryResultRow = QueryResultRow>(text: string, values?: any[]): Promise<{ rows: T[]; rowCount: number | null }>;
};

function asVehicle(row: VehicleRow) {
	return {
		id: row.id as string,
		ownerId: row.owner_id as string,
		vehicleType: row.vehicle_type as string,
		title: row.title as string,
		make: (row.make as string | null) ?? null,
		model: (row.model as string | null) ?? null,
		year: (row.model_year as number | null) ?? null,
		description: (row.description as string | null) ?? null,
		attributes: (row.attributes as Record<string, string | number | boolean | null>) ?? {},
		visibility: row.visibility as string,
		coverMediaId: (row.cover_media_id as string | null) ?? null,
		coverUrl: row.cover_media_id ? `/api/v1/media/${row.cover_media_id}/content` : null,
		createdAt: row.created_at as Date,
		updatedAt: row.updated_at as Date
	};
}

function validateAttributes(type: string, attributes: Record<string, unknown> | undefined) {
	const value = attributes ?? {};
	const allowed = attributeKeys[type] ?? new Set<string>();
	const unknown = Object.keys(value).filter((key) => !allowed.has(key));
	if (unknown.length) throw new AppError(422, 'Thuộc tính phương tiện không hợp lệ', `Các trường này không được hỗ trợ cho loại ${type}: ${unknown.join(', ')}.`);
	return value;
}

async function vehicleTypeId(slug: string, client: Queryable = pool): Promise<number> {
	const result = await client.query<{ id: number }>('SELECT id FROM vehicle_types WHERE slug = $1 AND active = true', [slug]);
	if (!result.rows[0]) throw new AppError(422, 'Loại phương tiện không hợp lệ', 'Chọn một loại phương tiện đang hoạt động.');
	return result.rows[0].id;
}

async function assertCoverOwnedReady(userId: string, mediaId: string | null | undefined, client: Queryable = pool): Promise<void> {
	if (!mediaId) return;
	const result = await client.query(`SELECT 1 FROM media_assets WHERE id = $1 AND owner_id = $2 AND status = 'ready'`, [mediaId, userId]);
	if (!result.rowCount) throw new AppError(422, 'Ảnh bìa không hợp lệ', 'Chỉ dùng ảnh đã xử lý thuộc tài khoản của bạn.');
}

export async function listVehicleTypes() {
	const result = await pool.query<{ slug: string; name: string; sort_order: number }>(
		'SELECT slug, name, sort_order FROM vehicle_types WHERE active = true ORDER BY sort_order, slug'
	);
	return { items: result.rows.map((row) => ({ slug: row.slug, name: row.name, sortOrder: row.sort_order })) };
}

export async function listMyVehicles(userId: string, page: CursorPage = {}) {
	const limit = Math.max(1, Math.min(50, page.limit ?? 20));
	const cursor = decodeCursor(page.cursor ?? null);
	const result = cursor
		? await pool.query<VehicleRow>(
			`SELECT v.*, t.slug AS vehicle_type FROM vehicles v JOIN vehicle_types t ON t.id = v.vehicle_type_id
			 WHERE v.owner_id = $1 AND v.deleted_at IS NULL AND (v.created_at, v.id) < ($2::timestamptz, $3::uuid)
			 ORDER BY v.created_at DESC, v.id DESC LIMIT $4`, [userId, cursor.createdAt, cursor.id, limit + 1]
		)
		: await pool.query<VehicleRow>(
			`SELECT v.*, t.slug AS vehicle_type FROM vehicles v JOIN vehicle_types t ON t.id = v.vehicle_type_id
			 WHERE v.owner_id = $1 AND v.deleted_at IS NULL
			 ORDER BY v.created_at DESC, v.id DESC LIMIT $2`, [userId, limit + 1]
		);
	const hasMore = result.rows.length > limit;
	const rows = result.rows.slice(0, limit);
	const last = rows.at(-1);
	return { items: rows.map(asVehicle), nextCursor: hasMore && last ? encodeCursor(last.created_at as Date, last.id as string) : null };
}

export async function createVehicle(userId: string, input: unknown) {
	const data = parseInput(vehicleCreateSchema, input);
	const attrs = validateAttributes(data.vehicleType, data.attributes);
	return transaction(async (client) => {
		const typeId = await vehicleTypeId(data.vehicleType, client);
		await assertCoverOwnedReady(userId, data.coverMediaId, client);
		const result = await client.query<VehicleRow>(
			`INSERT INTO vehicles(owner_id, vehicle_type_id, title, make, model, model_year, description, cover_media_id, attributes, visibility)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
			 RETURNING *, $11::text AS vehicle_type`,
			[userId, typeId, data.title, data.make ?? null, data.model ?? null, data.year ?? null, data.description ?? null,
				data.coverMediaId ?? null, JSON.stringify(attrs), data.visibility ?? 'public', data.vehicleType]
		);
		return asVehicle(result.rows[0]!);
	});
}

export async function getVehicle(viewerId: string | null, vehicleId: string) {
	const result = await pool.query<VehicleRow>(
		`SELECT v.*, t.slug AS vehicle_type FROM vehicles v JOIN vehicle_types t ON t.id = v.vehicle_type_id
		 JOIN users u ON u.id = v.owner_id
		 WHERE v.id = $1 AND v.deleted_at IS NULL AND u.status = 'active' AND u.deleted_at IS NULL
		   AND (v.owner_id = $2 OR v.visibility = 'public')`, [vehicleId, viewerId]
	);
	if (!result.rows[0]) throw new AppError(404, 'Không tìm thấy phương tiện', 'Phương tiện không tồn tại hoặc không hiển thị.');
	return asVehicle(result.rows[0]);
}

export async function getMyVehicle(userId: string, vehicleId: string) {
	const result = await pool.query<VehicleRow>(
		`SELECT v.*, t.slug AS vehicle_type FROM vehicles v JOIN vehicle_types t ON t.id = v.vehicle_type_id
		 WHERE v.id = $1 AND v.owner_id = $2 AND v.deleted_at IS NULL`, [vehicleId, userId]
	);
	if (!result.rows[0]) throw new AppError(404, 'Không tìm thấy phương tiện', 'Phương tiện không tồn tại trong gara của bạn.');
	return asVehicle(result.rows[0]);
}

export async function patchVehicle(userId: string, vehicleId: string, input: unknown) {
	const data = parseInput(vehiclePatchSchema, input);
	return transaction(async (client) => {
		const current = await client.query<VehicleRow>('SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL FOR UPDATE', [vehicleId, userId]);
		if (!current.rows[0]) throw new AppError(404, 'Không tìm thấy phương tiện', 'Phương tiện không tồn tại hoặc bạn không có quyền sửa.');
		const row = current.rows[0];
		const nextType = data.vehicleType ?? (await client.query<{ slug: string }>('SELECT slug FROM vehicle_types WHERE id = $1', [row.vehicle_type_id])).rows[0]!.slug;
		const attrs = validateAttributes(nextType, Object.hasOwn(data, 'attributes') ? data.attributes : row.attributes as Record<string, unknown>);
		const typeId = Object.hasOwn(data, 'vehicleType') ? await vehicleTypeId(nextType, client) : row.vehicle_type_id as number;
		if (Object.hasOwn(data, 'coverMediaId')) await assertCoverOwnedReady(userId, data.coverMediaId, client);
		const updates: Array<[string, unknown]> = [
			['vehicle_type_id', typeId], ['title', data.title ?? row.title], ['make', Object.hasOwn(data, 'make') ? data.make : row.make],
			['model', Object.hasOwn(data, 'model') ? data.model : row.model], ['model_year', Object.hasOwn(data, 'year') ? data.year : row.model_year],
			['description', Object.hasOwn(data, 'description') ? data.description : row.description], ['attributes', JSON.stringify(attrs)],
			['visibility', data.visibility ?? row.visibility], ['cover_media_id', Object.hasOwn(data, 'coverMediaId') ? data.coverMediaId : row.cover_media_id]
		];
		const sets = updates.map(([column], index) => `${column} = $${index + 1}${column === 'attributes' ? '::jsonb' : ''}`);
		const values = updates.map(([, value]) => value);
		values.push(vehicleId, userId);
		const updated = await client.query<VehicleRow>(
			`UPDATE vehicles SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length - 1} AND owner_id = $${values.length}
			 RETURNING *, $${values.length + 1}::text AS vehicle_type`,
			[...values, nextType]
		);
		return asVehicle(updated.rows[0]!);
	});
}

export async function deleteVehicle(userId: string, vehicleId: string): Promise<void> {
	const result = await pool.query(
		'UPDATE vehicles SET deleted_at = now(), updated_at = now() WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL',
		[vehicleId, userId]
	);
	if (!result.rowCount) throw new AppError(404, 'Không tìm thấy phương tiện', 'Phương tiện không tồn tại hoặc bạn không có quyền xóa.');
}
