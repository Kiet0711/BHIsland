import type { RequestHandler } from './$types';
import { AppError, uploadPendingMedia } from '@gisland/backend';
import { api, assertSameOrigin, rateLimit, readBoundedBody, requireUser } from '#lib/server/api';

export const PUT: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	const user = requireUser(event.locals.user);
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.params.mediaId)) {
		throw new AppError(404, 'Không tìm thấy media', 'Tệp không tồn tại.');
	}
	rateLimit(event, `media-upload:${user.id}`, 30, 60 * 60 * 1000);
	const bytes = await readBoundedBody(event.request, 15 * 1024 * 1024);
	await uploadPendingMedia(user.id, event.params.mediaId, event.request.headers.get('content-type'), bytes);
	return new Response(null, { status: 204 });
});
