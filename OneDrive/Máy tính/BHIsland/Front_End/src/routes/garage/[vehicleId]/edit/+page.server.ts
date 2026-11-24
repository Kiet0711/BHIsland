import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppError, deleteVehicle, getMyVehicle, patchVehicle } from '@gisland/backend';
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

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) throw redirect(303, '/login');
	return { vehicle: await getMyVehicle(locals.user.id, params.vehicleId) };
};

export const actions: Actions = {
	default: async (event) => {
		assertSameOrigin(event.request);
		if (!event.locals.user) throw redirect(303, '/login');
		const form = await event.request.formData();
		try {
			await patchVehicle(event.locals.user.id, event.params.vehicleId, vehicleForm(form));
			return { success: true };
		} catch (error) {
			if (error instanceof AppError) return fail(error.status, { error: error.message });
			throw error;
		}
	},
	delete: async (event) => {
		assertSameOrigin(event.request);
		if (!event.locals.user) throw redirect(303, '/login');
		try {
			await deleteVehicle(event.locals.user.id, event.params.vehicleId);
		} catch (error) {
			if (error instanceof AppError) return fail(error.status, { error: error.message });
			throw error;
		}
		throw redirect(303, '/garage');
	}
};
