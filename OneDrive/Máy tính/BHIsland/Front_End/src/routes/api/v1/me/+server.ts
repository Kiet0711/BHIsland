import type { RequestHandler } from './$types';
import { getMyProfile, patchMyProfile } from '@gisland/backend';
import { api, assertSameOrigin, json, readJson, requireUser } from '#lib/server/api';

export const GET: RequestHandler = (event) => api(event, async () => {
	const user = requireUser(event.locals.user);
	return json(await getMyProfile(user.id));
});

export const PATCH: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	const user = requireUser(event.locals.user);
	return json(await patchMyProfile(user.id, await readJson(event.request)));
});
