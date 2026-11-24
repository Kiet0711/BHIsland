import type { RequestHandler } from './$types';
import { AppError, deleteVehicle, getVehicle, patchVehicle } from '@gisland/backend';
import { api, assertSameOrigin, json, readJson, requireUser } from '#lib/server/api';

function assertUuid(value: string): void {
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
		throw new AppError(404, 'Không tìm thấy phương tiện', 'Phương tiện không tồn tại hoặc không hiển thị.');
	}
}

export const GET: RequestHandler = (event) => api(event, async () => {
	assertUuid(event.params.vehicleId);
	return json(await getVehicle(event.locals.user?.id ?? null, event.params.vehicleId));
});

export const PATCH: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	const user = requireUser(event.locals.user);
	assertUuid(event.params.vehicleId);
	return json(await patchVehicle(user.id, event.params.vehicleId, await readJson(event.request)));
});

export const DELETE: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	const user = requireUser(event.locals.user);
	assertUuid(event.params.vehicleId);
	await deleteVehicle(user.id, event.params.vehicleId);
	return new Response(null, { status: 204 });
});
