import type { RequestHandler } from './$types';
import { resetPassword } from '@gisland/backend';
import { api, rateLimit, readJson } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	rateLimit(event, 'reset-password', 8, 60 * 60 * 1000);
	await resetPassword(await readJson(event.request));
	return new Response(null, { status: 204 });
});
