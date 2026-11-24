import type { RequestHandler } from './$types';
import { AppError, completeUpload } from '@gisland/backend';
import { api, assertSameOrigin, json, rateLimit, requireUser } from '#lib/server/api';

export const POST: RequestHandler = (event) => api(event, async () => {
	assertSameOrigin(event.request);
	const user = requireUser(event.locals.user);
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.params.mediaId)) {
		throw new AppError(404, 'Không tìm thấy media', 'Tệp không tồn tại.');
	}
	rateLimit(event, `media-complete:${user.id}`, 30, 60 * 60 * 1000);
	return json(await completeUpload(user.id, event.params.mediaId));
});
