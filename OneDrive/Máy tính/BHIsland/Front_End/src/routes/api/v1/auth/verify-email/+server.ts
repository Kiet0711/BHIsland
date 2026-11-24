import type { RequestHandler } from './$types';
import { verifyEmail } from '@gisland/backend';
import { api, readJson } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	await verifyEmail(await readJson(event.request));
	return new Response(null, { status: 204 });
});
