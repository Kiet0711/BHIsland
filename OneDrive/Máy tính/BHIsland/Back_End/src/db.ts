import pg from 'pg';
import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './config.js';

const { Pool } = pg;

const globalPool = globalThis as typeof globalThis & { __gislandPgPool?: InstanceType<typeof Pool> };
export const pool = globalPool.__gislandPgPool ?? new Pool({
	connectionString: config.databaseUrl,
	max: 5,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 5_000,
	application_name: 'gisland-web'
});

if (config.nodeEnv !== 'production') globalPool.__gislandPgPool = pool;

export function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []): Promise<QueryResult<T>> {
	return pool.query<T>(text, values);
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const result = await work(client);
		await client.query('COMMIT');
		return result;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}
