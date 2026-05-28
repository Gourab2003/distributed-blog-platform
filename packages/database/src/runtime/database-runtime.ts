import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { InfrastructureError, ErrorCodes } from '@platform/errors';
import { createPostgresClient } from '../client/postgres-client.js';
import type { PostgresClient } from '../client/postgres-client.js';
import type { DatabaseRuntimeOptions } from '../types/database-options.js';
import * as schema from '../schema/index.js';

export type DatabaseSchema = typeof schema;

export interface DatabaseRuntime {
    readonly db: PostgresJsDatabase<DatabaseSchema>;
    readonly shutdown: () => Promise<void>;
}

export async function createDatabaseRuntime(
    options: DatabaseRuntimeOptions,
): Promise<DatabaseRuntime> {
    const { config, logger } = options;

    let client: PostgresClient;

    try {
        client = createPostgresClient(config);
        await client`SELECT 1`;
        logger.info('database connection established');
    } catch (error) {
        throw new InfrastructureError(
            'Failed to establish database connection',
            { cause: error instanceof Error ? error.message : String(error) },
        );
    }

    const db = drizzle(client, { schema });

    const shutdown = async (): Promise<void> => {
        try {
            await client.end({ timeout: 5 });
            logger.info('database connection pool closed');
        } catch (error) {
            logger.error('error during database connection pool shutdown', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    };

    return { db, shutdown };
}