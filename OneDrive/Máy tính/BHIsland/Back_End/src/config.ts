function positiveInteger(name: string, fallback: number): number {
	const raw = process.env[name];
	if (!raw) return fallback;
	const value = Number(raw);
	if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`);
	return value;
}

export const config = Object.freeze({
	nodeEnv: process.env.NODE_ENV ?? 'development',
	publicOrigin: process.env.PUBLIC_ORIGIN ?? (process.env.NODE_ENV === 'production' ? 'https://localhost' : 'http://localhost:5173'),
	databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
	mediaDirectory: process.env.MEDIA_STORAGE_DIR,
	devMailboxDirectory: process.env.DEV_MAILBOX_DIR,
	sessionTtlHours: positiveInteger('SESSION_TTL_HOURS', 168),
	verificationTtlHours: positiveInteger('EMAIL_VERIFY_TTL_HOURS', 24),
	passwordResetTtlMinutes: positiveInteger('PASSWORD_RESET_TTL_MINUTES', 30),
	get cookieSecure() {
		return this.nodeEnv === 'production';
	}
});

