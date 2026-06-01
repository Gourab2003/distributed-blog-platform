import { resolve } from 'node:path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// 1. Load the root .env file so we can access DATABASE_URL when running via CLI
config({ path: resolve(process.cwd(), '../../.env') });

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is missing.');
    process.exit(1);
}

async function runMigrations() {
    console.log('⏳ Initializing database migration...');

    // 2. Create a dedicated migration client with a single connection (max: 1)
    const migrationClient = postgres(databaseUrl!, { max: 1 });
    const db = drizzle(migrationClient);

    try {
        // 3. Execute the migrations stored in the /migrations folder
        console.log('🚀 Applying migrations...');
        await migrate(db, { migrationsFolder: './migrations' });

        console.log('✅ Migrations completed successfully.');
    } catch (error) {
        console.error('❌ Migration failed:');
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    } finally {
        // 4. Close the connection so the script exits cleanly
        await migrationClient.end();
        console.log('🔌 Migration connection closed.');
    }
}

runMigrations();