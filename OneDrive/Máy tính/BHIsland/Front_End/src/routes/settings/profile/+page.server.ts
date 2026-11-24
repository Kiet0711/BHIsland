import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppError, getMyProfile, patchMyProfile } from '@gisland/backend';
import { assertSameOrigin } from '#lib/server/api';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	return { profile: await getMyProfile(locals.user.id) };
};

export const actions: Actions = {
	default: async (event) => {
		assertSameOrigin(event.request);
		if (!event.locals.user) throw redirect(303, '/login');
		const form = await event.request.formData();
		const avatarId = String(form.get('avatarMediaId') ?? '');
		try {
			await patchMyProfile(event.locals.user.id, {
				displayName: String(form.get('displayName') ?? ''),
				bio: String(form.get('bio') ?? ''),
				locationText: String(form.get('locationText') ?? ''),
				websiteUrl: String(form.get('websiteUrl') ?? '') || null,
				privacy: String(form.get('privacy') ?? 'public'),
				avatarMediaId: avatarId || null
			});
			return { success: true };
		} catch (error) {
			if (error instanceof AppError) return fail(error.status, { error: error.message });
			throw error;
		}
	}
};
