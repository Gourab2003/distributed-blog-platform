import postgres from 'postgres';
import type { DatabaseConfiguration } from '@platform/configuration';

export type PostgresClient = postgres.Sql;

export function createPostgresClient(
    config: DatabaseConfiguration,
): PostgresClient {
    return postgres(config.url, {
        max: config.pool.max,

        idle_timeout: 30,
        connect_timeout: 10,

        prepare: true,

        ssl: config.ssl,

        onnotice: () => { },
    });
}