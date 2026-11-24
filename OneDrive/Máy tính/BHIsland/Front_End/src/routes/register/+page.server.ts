import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AppError, registerAccount } from '@gisland/backend';
import { rateLimit } from '#lib/server/api';

export const actions: Actions = {
	default: async (event) => {
		rateLimit(event, 'register-form', 5, 60 * 60 * 1000);
		const form = await event.request.formData();
		try {
			await registerAccount({
				email: String(form.get('email') ?? ''),
				password: String(form.get('password') ?? ''),
				username: String(form.get('username') ?? ''),
				displayName: String(form.get('displayName') ?? '')
			});
			return { success: true };
		} catch (error) {
			if (error instanceof AppError) return fail(error.status, { error: error.message });
			throw error;
		}
	}
};
