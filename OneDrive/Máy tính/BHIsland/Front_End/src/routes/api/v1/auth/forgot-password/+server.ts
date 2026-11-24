import type { RequestHandler } from './$types';
import { requestPasswordReset } from '@gisland/backend';
import { api, json, rateLimit, readJson } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	rateLimit(event, 'forgot-password', 3, 60 * 60 * 1000);
	return json(await requestPasswordReset(await readJson(event.request)), 202);
});
