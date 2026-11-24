import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppError, loginAccount } from '@gisland/backend';
import { applySessionCookie, rateLimit } from '#lib/server/api';

export const load: PageServerLoad = ({ url }) => ({ verified: url.searchParams.get('verified') === '1' });

export const actions: Actions = {
	default: async (event) => {
		rateLimit(event, 'login-form', 10, 15 * 60 * 1000);
		const form = await event.request.formData();
		try {
			const session = await loginAccount({ email: String(form.get('email') ?? ''), password: String(form.get('password') ?? '') });
			applySessionCookie(event, session);
		} catch (error) {
			if (error instanceof AppError) return fail(error.status, { error: error.message });
			throw error;
		}
		throw redirect(303, '/');
	}
};
