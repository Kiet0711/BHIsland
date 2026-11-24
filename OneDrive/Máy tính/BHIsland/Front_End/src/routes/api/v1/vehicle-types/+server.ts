import type { RequestHandler } from './$types';
import { listVehicleTypes } from '@gisland/backend';
import { api, json } from '#lib/server/api';

export const GET: RequestHandler = (event) => api(event, async () => json(await listVehicleTypes()));
