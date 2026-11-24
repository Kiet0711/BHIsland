import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const dataDir = resolve(root, '.local-data');
await mkdir(dataDir, { recursive: true });

const cli = resolve(root, 'node_modules/@electric-sql/pglite-socket/dist/scripts/server.js');
const child = spawn(process.execPath, [cli, '--db=./.local-data/postgres', '--port=5432', '--max-connections=5'], {
	cwd: root,
	stdio: 'inherit',
});
child.on('error', (error) => {
	console.error('Could not start the local PGlite server:', error);
	process.exitCode = 1;
});
child.on('exit', (code, signal) => {
	if (signal) process.kill(process.pid, signal);
	else process.exitCode = code ?? 1;
});
