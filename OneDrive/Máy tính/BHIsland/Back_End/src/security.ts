import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from './config.js';
import { AppError } from './errors.js';

export function makeToken(): string {
	return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): Buffer {
	return createHash('sha256').update(token, 'utf8').digest();
}

function cursorKey(): Buffer {
	const secret = process.env.CURSOR_SECRET;
	if (!secret && config.nodeEnv === 'production') throw new Error('CURSOR_SECRET is required in production.');
	return Buffer.from(secret ?? 'development-cursor-secret-keep-local-only-32bytes', 'utf8');
}

export function encodeCursor(createdAt: Date, id: string): string {
	const payload = Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString('base64url');
	const signature = createHmac('sha256', cursorKey()).update(payload).digest('base64url');
	return `${payload}.${signature}`;
}

export function decodeCursor(cursor: string | null): { createdAt: string; id: string } | null {
	if (!cursor) return null;
	const [payload, providedSignature, extra] = cursor.split('.');
	if (!payload || !providedSignature || extra) throw new AppError(400, 'Con trỏ không hợp lệ', 'Cursor không đúng định dạng.');
	const expected = createHmac('sha256', cursorKey()).update(payload).digest();
	let actual: Buffer;
	try {
		actual = Buffer.from(providedSignature, 'base64url');
	} catch {
		throw new AppError(400, 'Con trỏ không hợp lệ', 'Cursor không đúng định dạng.');
	}
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
		throw new AppError(400, 'Con trỏ không hợp lệ', 'Cursor không hợp lệ hoặc đã hết hiệu lực.');
	}
	try {
		const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { createdAt?: unknown; id?: unknown };
		if (typeof decoded.createdAt !== 'string' || Number.isNaN(Date.parse(decoded.createdAt)) || typeof decoded.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(decoded.id)) throw new Error('bad payload');
		return { createdAt: new Date(decoded.createdAt).toISOString(), id: decoded.id };
	} catch {
		throw new AppError(400, 'Con trỏ không hợp lệ', 'Cursor không đúng định dạng.');
	}
}
