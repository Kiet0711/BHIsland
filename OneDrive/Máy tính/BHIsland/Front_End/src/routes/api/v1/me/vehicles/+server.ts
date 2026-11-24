import type { RequestHandler } from './$types';
import { AppError, createVehicle, listMyVehicles } from '@gisland/backend';
import { api, assertSameOrigin, json, readJson, requireUser } from '#lib/server/api';

export const GET: RequestHandler = (event) => api(event, async () => {
	const user = requireUser(event.locals.user);
	const rawLimit = event.url.searchParams.get('limit');
	const limit = rawLimit === null ? 20 : Number(rawLimit);
	if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new AppError(422, 'Limit không hợp lệ', 'Limit phải từ 1 đến 50.');
	return json(await listMyVehicles(user.id, { limit, cursor: event.url.searchParams.get('cursor') }));
});

export const POST: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	const user = requireUser(event.locals.user);
	return json(await createVehicle(user.id, await readJson(event.request)), 201);
});
