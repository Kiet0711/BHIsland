import type { RequestHandler } from './$types';
import { logoutSession } from '@gisland/backend';
import { api, assertSameOrigin, requireUser } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	requireUser(event.locals.user);
	await logoutSession(event.cookies.get('gisland_session'));
	event.cookies.delete('gisland_session', { path: '/' });
	return new Response(null, { status: 204 });
});
