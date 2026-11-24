import type { RequestHandler } from './$types';
import { loginAccount } from '@gisland/backend';
import { api, applySessionCookie, json, rateLimit, readJson } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	rateLimit(event, 'login', 10, 15 * 60 * 1000);
	const session = await loginAccount(await readJson(event.request));
	applySessionCookie(event, session);
	return json({ user: session.user, expiresAt: session.expiresAt });
});
