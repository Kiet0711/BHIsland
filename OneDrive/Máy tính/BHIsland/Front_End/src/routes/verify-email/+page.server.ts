import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppError, config, verifyEmail } from '@gisland/backend';

export const load: PageServerLoad = ({ url, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex, nofollow' });
	const token = url.searchParams.get('token') ?? '';
	return { token, available: config.nodeEnv !== 'production' || token.length > 0 };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		try {
			await verifyEmail({ token: String(form.get('token') ?? '') });
		} catch (cause) {
			if (cause instanceof AppError) return fail(cause.status, { error: cause.message });
			throw cause;
		}
		throw redirect(303, '/login?verified=1');
	}
};
