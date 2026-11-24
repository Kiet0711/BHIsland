import type { RequestHandler } from './$types';
import { getPublicProfile } from '@gisland/backend';
import { api, json } from '#lib/server/api';

export const GET: RequestHandler = (event) => api(event, async () => json(await getPublicProfile(event.params.username)));
