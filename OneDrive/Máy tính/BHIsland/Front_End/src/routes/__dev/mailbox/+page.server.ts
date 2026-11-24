import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { config, readDevMailbox } from '@gisland/backend';

export const load: PageServerLoad = async () => {
	if (config.nodeEnv === 'production') throw error(404, 'Not found');
	return { messages: await readDevMailbox() };
};
