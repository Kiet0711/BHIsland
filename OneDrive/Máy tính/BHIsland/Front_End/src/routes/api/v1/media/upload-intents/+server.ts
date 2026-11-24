import type { RequestHandler } from './$types';
import { createUploadIntent } from '@gisland/backend';
import { api, assertSameOrigin, json, rateLimit, readJson, requireUser } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	const user = requireUser(event.locals.user);
	rateLimit(event, `media-intent:${user.id}`, 30, 60 * 60 * 1000);
	return json(await createUploadIntent(user.id, await readJson(event.request)), 201);
});
