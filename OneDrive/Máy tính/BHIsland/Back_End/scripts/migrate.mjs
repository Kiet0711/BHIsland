import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', 'migrations');
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';
const pool = new Pool({ connectionString: databaseUrl, max: 1 });

try {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [731245091]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const files = (await readdir(migrationsDir))
      .filter((name) => /^\d{4}_[a-z0-9_]+\.sql$/.test(name))
      .sort();

    for (const name of files) {
      const exists = await client.query('SELECT 1 FROM app_migrations WHERE name = $1', [name]);
      if (exists.rowCount) {
        console.log(`skip ${name}`);
        continue;
      }

      const sql = await readFile(join(migrationsDir, name), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO app_migrations(name) VALUES ($1)', [name]);
        await client.query('COMMIT');
        console.log(`applied ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    await client.query('SELECT pg_advisory_unlock($1)', [731245091]);
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
