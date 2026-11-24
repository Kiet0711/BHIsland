import type { RequestHandler } from './$types';
import { registerAccount } from '@gisland/backend';
import { api, json, rateLimit, readJson } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	rateLimit(event, 'register', 5, 60 * 60 * 1000);
	return json(await registerAccount(await readJson(event.request)), 201);
});
