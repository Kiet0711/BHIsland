import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { config } from './config.js';
import { pool, transaction } from './db.js';
import { AppError, parseInput } from './errors.js';
import { deliverAuthLink } from './mail.js';
import { hashToken, makeToken } from './security.js';

const emailSchema = z.string().email().max(254);
const registerSchema = z.object({
	email: emailSchema,
	password: z.string().min(12).max(128),
	username: z.string().regex(/^[a-zA-Z0-9_]{3,30}$/),
	displayName: z.string().trim().min(1).max(80)
}).strict();
const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).strict();
const tokenSchema = z.object({ token: z.string().min(32).max(512) }).strict();
const resetSchema = z.object({ token: z.string().min(32).max(512), newPassword: z.string().min(12).max(128) }).strict();
const loadArgon2 = async () => (await import('argon2')).default;

export type AuthenticatedUser = {
	id: string;
	username: string;
	displayName: string;
	bio: string | null;
	avatarUrl: string | null;
	createdAt: Date;
};

export type SessionResult = {
	token: string;
	expiresAt: Date;
	user: AuthenticatedUser;
};

function emailNormalized(value: string): string {
	return value.trim().toLowerCase();
}

function publicUser(row: Record<string, unknown>) {
	return {
		id: row.id as string,
		username: row.username as string,
		displayName: row.display_name as string,
		bio: (row.bio as string | null) ?? null,
		avatarUrl: row.avatar_media_id ? `/api/v1/media/${row.avatar_media_id}/content` : null,
		createdAt: row.created_at as Date
	};
}

function newToken(): string {
	return randomBytes(32).toString('base64url');
}

export function normalizeEmail(value: string): string {
	return emailNormalized(value);
}

export async function registerAccount(input: unknown): Promise<{ message: string }> {
	const data = parseInput(registerSchema, input);
	const email = emailNormalized(data.email);
	const username = data.username.toLowerCase();
	const argon2 = await loadArgon2();
	const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });
	const token = newToken();
	const expiry = new Date(Date.now() + config.verificationTtlHours * 60 * 60 * 1000);
	let userId: string;

	try {
		userId = await transaction(async (client) => {
			const user = await client.query<{ id: string }>(
				`INSERT INTO users(email_normalized, password_hash, username, display_name, status)
				 VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
				[email, passwordHash, username, data.displayName]
			);
			const id = user.rows[0]!.id;
			await client.query('INSERT INTO user_profiles(user_id) VALUES ($1)', [id]);
			await client.query(
				`INSERT INTO auth_tokens(user_id, purpose, token_hash, expires_at)
				 VALUES ($1, 'email_verification', $2, $3)`,
				[id, hashToken(token), expiry]
			);
			return id;
		});
	} catch (error) {
		if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
			throw new AppError(409, 'Tài khoản đã tồn tại', 'Email hoặc username đã được sử dụng.');
		}
		throw error;
	}

	await deliverAuthLink('verify-email', email, token).catch(async (error) => {
		await pool.query(`UPDATE auth_tokens SET consumed_at = now() WHERE user_id = $1 AND purpose = 'email_verification' AND consumed_at IS NULL`, [userId]);
		throw error;
	});
	return { message: 'Nếu email hợp lệ, hướng dẫn xác minh sẽ được gửi.' };
}

export async function verifyEmail(input: unknown): Promise<void> {
	const { token } = parseInput(tokenSchema, input);
	await transaction(async (client) => {
		const row = await client.query<{ id: string; user_id: string }>(
			`SELECT id, user_id FROM auth_tokens
			 WHERE token_hash = $1 AND purpose = 'email_verification'
			   AND consumed_at IS NULL AND expires_at > now()
			 FOR UPDATE`, [hashToken(token)]
		);
		if (!row.rowCount) throw new AppError(400, 'Liên kết xác minh không hợp lệ', 'Token đã hết hạn, đã dùng hoặc không tồn tại.');
		const authToken = row.rows[0]!;
		await client.query('UPDATE auth_tokens SET consumed_at = now() WHERE id = $1', [authToken.id]);
		await client.query(`UPDATE users SET status = 'active', email_verified_at = now(), updated_at = now() WHERE id = $1 AND status = 'pending'`, [authToken.user_id]);
	});
}

export async function loginAccount(input: unknown): Promise<SessionResult> {
	const data = parseInput(loginSchema, input);
	const email = emailNormalized(data.email);
	const result = await pool.query<Record<string, unknown>>(
		`SELECT id, email_normalized, password_hash, username, display_name, bio, avatar_media_id, created_at, status, email_verified_at
		 FROM users WHERE email_normalized = $1 AND deleted_at IS NULL`, [email]
	);
	const user = result.rows[0];
	const argon2 = await loadArgon2();
	const dummyPasswordHash = await argon2.hash(randomBytes(32).toString('hex'), { type: argon2.argon2id });
	const matches = await argon2.verify((user?.password_hash as string | undefined) ?? dummyPasswordHash, data.password).catch(() => false);
	if (!user || !matches || user.status !== 'active' || !user.email_verified_at) {
		throw new AppError(401, 'Không thể đăng nhập', 'Email hoặc mật khẩu không đúng, hoặc tài khoản chưa được xác minh.');
	}

	const token = newToken();
	const expiresAt = new Date(Date.now() + config.sessionTtlHours * 60 * 60 * 1000);
	await pool.query(
		'INSERT INTO user_sessions(user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
		[user.id, hashToken(token), expiresAt]
	);
	return { token, expiresAt, user: publicUser(user) };
}

export async function authenticateSession(token: string | undefined): Promise<AuthenticatedUser | null> {
	if (!token || token.length > 256) return null;
	const result = await pool.query<Record<string, unknown>>(
		`SELECT u.id, u.username, u.display_name, u.bio, u.avatar_media_id, u.created_at
		 FROM user_sessions s JOIN users u ON u.id = s.user_id
		 WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()
		   AND u.status = 'active' AND u.deleted_at IS NULL`, [hashToken(token)]
	);
	return result.rows[0] ? publicUser(result.rows[0]) : null;
}

export async function logoutSession(token: string | undefined): Promise<void> {
	if (!token || token.length > 256) return;
	await pool.query('UPDATE user_sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL', [hashToken(token)]);
}

export async function requestPasswordReset(emailInput: unknown): Promise<{ message: string }> {
	const { email } = parseInput(z.object({ email: emailSchema }).strict(), emailInput);
	const normalized = emailNormalized(email);
	const result = await pool.query<{ id: string; email_normalized: string }>(
		`SELECT id, email_normalized FROM users
		 WHERE email_normalized = $1 AND status = 'active' AND email_verified_at IS NOT NULL AND deleted_at IS NULL`, [normalized]
	);
	if (result.rows[0]) {
		const user = result.rows[0];
		const token = newToken();
		const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
		await pool.query(
			`INSERT INTO auth_tokens(user_id, purpose, token_hash, expires_at)
			 VALUES ($1, 'password_reset', $2, $3)`,
			[user.id, hashToken(token), expiresAt]
		);
		await deliverAuthLink('reset-password', user.email_normalized, token);
	}
	return { message: 'Nếu tài khoản tồn tại, hướng dẫn sẽ được gửi.' };
}

export async function resetPassword(input: unknown): Promise<void> {
	const { token, newPassword } = parseInput(resetSchema, input);
	const argon2 = await loadArgon2();
	const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
	await transaction(async (client) => {
		const row = await client.query<{ id: string; user_id: string }>(
			`SELECT id, user_id FROM auth_tokens
			 WHERE token_hash = $1 AND purpose = 'password_reset'
			   AND consumed_at IS NULL AND expires_at > now()
			 FOR UPDATE`, [hashToken(token)]
		);
		if (!row.rowCount) throw new AppError(422, 'Token không hợp lệ', 'Liên kết đặt lại đã hết hạn, đã dùng hoặc không tồn tại.');
		const authToken = row.rows[0]!;
		await client.query('UPDATE auth_tokens SET consumed_at = now() WHERE id = $1', [authToken.id]);
		await client.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, authToken.user_id]);
		await client.query('UPDATE user_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [authToken.user_id]);
	});
}
