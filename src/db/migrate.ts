import { resolve } from 'node:path';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is missing.');
  process.exit(1);
}

async function runMigrations() {
  console.log('⏳ Initializing database migration...');

  const migrationClient = postgres(databaseUrl!, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    console.log('🚀 Applying migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await migrationClient.end();
    console.log('🔌 Migration connection closed.');
  }
}

runMigrations();
