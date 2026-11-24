import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AppError, requestPasswordReset } from '@gisland/backend';
import { rateLimit } from '#lib/server/api';

export const actions: Actions = {
	default: async (event) => {
		rateLimit(event, 'forgot-password-form', 3, 60 * 60 * 1000);
		const form = await event.request.formData();
		try {
			await requestPasswordReset({ email: String(form.get('email') ?? '') });
			return { success: true };
		} catch (error) {
			if (error instanceof AppError) return fail(error.status, { error: error.message });
			throw error;
		}
	}
};
