import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AppError, getPublicProfile } from '@gisland/backend';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	try {
		const profile = await getPublicProfile(params.username);
		setHeaders({ 'cache-control': 'public, max-age=60' });
		return { profile };
	} catch (cause) {
		if (cause instanceof AppError && cause.status === 404) throw error(404, 'Không tìm thấy hồ sơ công khai.');
		throw cause;
	}
};
