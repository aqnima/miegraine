import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Ensure data folder exists for local sqlite development
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqliteUrl = process.env.DATABASE_URL || `file:${path.join(dataDir, 'local.sqlite').replace(/\\/g, '/')}`;

const client = createClient({
  url: sqliteUrl,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
