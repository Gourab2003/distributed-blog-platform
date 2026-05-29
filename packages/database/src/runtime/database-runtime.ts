import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { InfrastructureError } from '@platform/errors';
import type { RuntimeResource, RuntimeState } from '@platform/runtime';
import { createPostgresClient } from '../client/postgres-client.js';
import type { PostgresClient } from '../client/postgres-client.js';
import type { DatabaseRuntimeOptions } from '../types/database-options.js';
import * as schema from '../schema/index.js';

export type DatabaseSchema = typeof schema;

export interface DatabaseRuntime extends RuntimeResource {
    readonly db: PostgresJsDatabase<DatabaseSchema>;
}

export function createDatabaseRuntime(options: DatabaseRuntimeOptions): DatabaseRuntime {
    const { config, logger } = options;

    let client: PostgresClient | null = null;
    let database: PostgresJsDatabase<DatabaseSchema> | null = null;
    let state: RuntimeState = 'idle';

    return {
        name: 'database',

        get state(): RuntimeState {
            return state;
        },

        get db(): PostgresJsDatabase<DatabaseSchema> {
            if (!database) {
                throw new InfrastructureError('Database accessed before initialization');
            }
            return database;
        },

        async start(): Promise<void> {
            if (state !== 'idle') {
                return;
            }

            state = 'starting';

            try {
                client = createPostgresClient(config);
                await client`SELECT 1`;

                database = drizzle(client, { schema });
                state = 'started';
                logger.info('Database connection established successfully');
            } catch (error) {
                state = 'stopped';
                throw new InfrastructureError('Failed to establish database connection', {
                    cause: error instanceof Error ? error.message : String(error),
                });
            }
        },

        async shutdown(): Promise<void> {
            if (state === 'idle' || state === 'stopped') {
                return;
            }

            state = 'shutting-down';

            try {
                if (client) {
                    await client.end({ timeout: 5 });
                }
                state = 'stopped';
                logger.info('Database connection pool closed');
            } catch (error) {
                state = 'stopped';
                logger.error('Error during database shutdown', {
                    metadata: {
                        error: error instanceof Error ? error.message : String(error),
                    },
                });
            }
        },
    };
}