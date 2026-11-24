import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppError, resetPassword } from '@gisland/backend';
import { rateLimit } from '#lib/server/api';

export const load: PageServerLoad = ({ url, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex, nofollow' });
	return { token: url.searchParams.get('token') ?? '' };
};

export const actions: Actions = {
	default: async (event) => {
		rateLimit(event, 'reset-password-form', 8, 60 * 60 * 1000);
		const form = await event.request.formData();
		try {
			await resetPassword({ token: String(form.get('token') ?? ''), newPassword: String(form.get('newPassword') ?? '') });
		} catch (cause) {
			if (cause instanceof AppError) return fail(cause.status, { error: cause.message });
			throw cause;
		}
		throw redirect(303, '/login?reset=1');
	}
};
