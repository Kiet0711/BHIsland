import type { Handle } from '@sveltejs/kit/hooks';
import { authenticateSession } from '@gisland/backend';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('gisland_session');
	event.locals.user = token ? await authenticateSession(token).catch(() => null) : null;
	return resolve(event);
};
