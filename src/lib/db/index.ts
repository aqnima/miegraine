import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const sqliteUrl = process.env.DATABASE_URL || 'file:./data/local.sqlite';

const client = createClient({
  url: sqliteUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
