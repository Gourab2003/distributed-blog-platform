import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config.js';
import * as schema from './schema.js';

const client = postgres(config.database.url, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: true,
  onnotice: () => {},
});

export const db = drizzle(client, { schema });
export type Database = typeof db;

export async function pingDatabase(): Promise<void> {
  await client`SELECT 1`;
}

export async function closeDatabase(): Promise<void> {
  await client.end({ timeout: 5 });
}
