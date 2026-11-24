import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppError, createVehicle, listMyVehicles, listVehicleTypes } from '@gisland/backend';
import { assertSameOrigin } from '#lib/server/api';

function vehicleForm(form: FormData) {
	const yearText = String(form.get('year') ?? '');
	return {
		vehicleType: String(form.get('vehicleType') ?? ''),
		title: String(form.get('title') ?? ''),
		make: String(form.get('make') ?? '') || null,
		model: String(form.get('model') ?? '') || null,
		year: yearText ? Number(yearText) : null,
		description: String(form.get('description') ?? '') || null,
		visibility: String(form.get('visibility') ?? 'public'),
		coverMediaId: String(form.get('coverMediaId') ?? '') || null
	};
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(303, '/login');
	const rawLimit = Number(url.searchParams.get('limit') ?? '20');
	const limit = Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 50 ? rawLimit : 20;
	const [vehicles, types] = await Promise.all([
		listMyVehicles(locals.user.id, { limit, cursor: url.searchParams.get('cursor') }),
		listVehicleTypes()
	]);
	return { vehicles, types: types.items };
};

export const actions: Actions = {
	default: async (event) => {
		assertSameOrigin(event.request);
		if (!event.locals.user) throw redirect(303, '/login');
		const form = await event.request.formData();
		try {
			await createVehicle(event.locals.user.id, vehicleForm(form));
			return { success: true };
		} catch (error) {
			if (error instanceof AppError) return fail(error.status, { error: error.message });
			throw error;
		}
	}
};
