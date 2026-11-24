import { randomUUID } from 'node:crypto';
import { AppError, config, enforceRateLimit, type AuthenticatedUser, clientAddress } from '@gisland/backend';
import type { RequestEvent } from '@sveltejs/kit';

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
	const responseHeaders = new Headers(headers);
	responseHeaders.set('content-type', 'application/json; charset=utf-8');
	return new Response(JSON.stringify(data), {
		status,
		headers: responseHeaders
	});
}

export async function api(event: RequestEvent, work: () => Response | Promise<Response>): Promise<Response> {
	try {
		return await work();
	} catch (error) {
		const requestId = randomUUID();
		if (error instanceof AppError) {
			const headers = new Headers({ 'content-type': 'application/problem+json; charset=utf-8', 'x-request-id': requestId });
			if (error.retryAfter) headers.set('retry-after', String(error.retryAfter));
			return new Response(JSON.stringify({
				type: `https://gisland.example/problems/${error.status}`,
				title: error.title,
				status: error.status,
				detail: error.message,
				requestId,
				...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {})
			}), { status: error.status, headers });
		}
		console.error('request_failed', { requestId, method: event.request.method, path: event.url.pathname, errorName: error instanceof Error ? error.name : 'unknown' });
		return new Response(JSON.stringify({
			type: 'https://gisland.example/problems/internal',
			title: 'Lỗi máy chủ',
			status: 500,
			detail: 'Đã xảy ra lỗi. Hãy thử lại sau.',
			requestId
		}), { status: 500, headers: { 'content-type': 'application/problem+json; charset=utf-8', 'x-request-id': requestId } });
	}
}

export async function readJson(request: Request): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		throw new AppError(400, 'JSON không hợp lệ', 'Request body phải là JSON hợp lệ.');
	}
}

export function requireUser(user: AuthenticatedUser | null): AuthenticatedUser {
	if (!user) throw new AppError(401, 'Chưa đăng nhập', 'Hãy đăng nhập để tiếp tục.');
	return user;
}

export function assertSameOrigin(request: Request): void {
	const origin = request.headers.get('origin');
	if (origin) {
		try {
			if (new URL(origin).origin !== new URL(config.publicOrigin).origin) throw new AppError(403, 'Yêu cầu bị từ chối', 'Origin không hợp lệ.');
		} catch (error) {
			if (error instanceof AppError) throw error;
			throw new AppError(403, 'Yêu cầu bị từ chối', 'Origin không hợp lệ.');
		}
	}
	if (request.headers.get('sec-fetch-site') === 'cross-site') throw new AppError(403, 'Yêu cầu bị từ chối', 'Cross-site mutation không được chấp nhận.');
}

export function applySessionCookie(event: RequestEvent, session: { token: string; expiresAt: Date }): void {
	event.cookies.set('gisland_session', session.token, {
		path: '/',
		httpOnly: true,
		secure: config.cookieSecure,
		sameSite: 'lax',
		expires: session.expiresAt,
		maxAge: Math.max(1, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000))
	});
}

export function rateLimit(event: RequestEvent, scope: string, limit: number, windowMs: number): void {
	enforceRateLimit(`${scope}:${clientAddress(() => event.getClientAddress())}`, limit, windowMs);
}

export async function readBoundedBody(request: Request, maxBytes: number): Promise<Uint8Array> {
	const declared = Number(request.headers.get('content-length') ?? 0);
	if (declared > maxBytes) throw new AppError(413, 'Tệp quá lớn', 'Kích thước upload vượt quá giới hạn.');
	if (!request.body) return new Uint8Array();
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > maxBytes) {
				await reader.cancel();
				throw new AppError(413, 'Tệp quá lớn', 'Kích thước upload vượt quá giới hạn.');
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	const body = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return body;
}
