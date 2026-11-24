import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const defaultMailbox = resolve(dirname(fileURLToPath(import.meta.url)), '../../.local-data/dev-mailbox');

export async function deliverAuthLink(kind: 'verify-email' | 'reset-password', email: string, token: string): Promise<void> {
	if (config.nodeEnv === 'production') {
		throw new Error('A production email provider must be configured before enabling authentication.');
	}
	const mailbox = config.devMailboxDirectory ?? defaultMailbox;
	await mkdir(mailbox, { recursive: true });
	const link = `${config.publicOrigin.replace(/\/$/, '')}/${kind}?token=${encodeURIComponent(token)}`;
	const record = {
		id: randomUUID(),
		kind,
		to: email,
		createdAt: new Date().toISOString(),
		link
	};
	const file = resolve(mailbox, `${record.createdAt.replaceAll(':', '-')}-${record.id}.json`);
	await writeFile(file, JSON.stringify(record, null, 2), { encoding: 'utf8', mode: 0o600, flag: 'wx' });
}

export async function readDevMailbox() {
	if (config.nodeEnv === 'production') return [];
	const mailbox = config.devMailboxDirectory ?? defaultMailbox;
	const files = await readdir(mailbox).catch(() => []);
	const messages = await Promise.all(files.filter((name) => name.endsWith('.json')).map(async (name) => {
		try {
			return JSON.parse(await readFile(resolve(mailbox, name), 'utf8')) as {
				id: string; kind: string; to: string; createdAt: string; link: string;
			};
		} catch {
			return null;
		}
	}));
	return messages.filter((message): message is NonNullable<typeof message> => message !== null)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50);
}
