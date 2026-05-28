import type { Config } from 'drizzle-kit';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set before running drizzle-kit');
}

export default {
    schema: './src/schema/**/**.table.ts',
    out: './migrations',
    driver: 'pg',
    dbCredentials: {
        connectionString: databaseUrl,
    },
    verbose: true,
    strict: true,
} satisfies Config;