import { AppError } from './errors.js';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function enforceRateLimit(key: string, limit: number, windowMs: number): void {
	const now = Date.now();
	let bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		bucket = { count: 0, resetAt: now + windowMs };
		buckets.set(key, bucket);
	}
	bucket.count += 1;
	if (buckets.size > 10_000) {
		for (const [entry, value] of buckets) if (value.resetAt <= now) buckets.delete(entry);
	}
	if (bucket.count > limit) {
		throw new AppError(429, 'Tạm thời bị giới hạn', 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.', undefined, Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
	}
}

export function clientAddress(getAddress: () => string): string {
	try {
		return getAddress();
	} catch {
		return 'unknown';
	}
}
