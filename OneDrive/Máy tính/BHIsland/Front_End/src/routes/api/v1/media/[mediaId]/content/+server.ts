import type { RequestHandler } from './$types';
import { AppError, readMedia } from '@gisland/backend';
import { api, requireUser } from '#lib/server/api';

export const GET: RequestHandler = (event) => api(event, async () => {
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.params.mediaId)) {
		throw new AppError(404, 'Không tìm thấy ảnh', 'Ảnh không tồn tại hoặc không hiển thị.');
	}
	const user = event.locals.user ? requireUser(event.locals.user) : null;
	const media = await readMedia(user?.id ?? null, event.params.mediaId);
	return new Response(new Uint8Array(media.data), {
		status: 200,
		headers: {
			'content-type': media.contentType,
			'content-length': String(media.byteSize),
			'cache-control': media.isPublic ? 'public, max-age=300' : 'private, no-store',
			'x-content-type-options': 'nosniff'
		}
	});
});
