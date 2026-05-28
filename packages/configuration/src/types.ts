import type { z } from 'zod';

import type { environmentEnum } from './environment/schema.js';

import type {
    loggingSchema,
} from './logging/schema.js';

import type {
    observabilitySchema,
} from './observability/schema.js';

import type {
    databaseSchema,
} from './database/schema.js';

import type {
    redisSchema,
} from './redis/schema.js';

import type {
    messagingSchema
} from './messaging/schema.js'

export type Environment =
    z.infer<typeof environmentEnum>;

export type LoggingConfiguration =
    z.infer<typeof loggingSchema>;

export type ObservabilityConfiguration =
    z.infer<typeof observabilitySchema>;

export type DatabaseConfiguration =
    z.infer<typeof databaseSchema>;

export type RedisConfiguration =
    z.infer<typeof redisSchema>;

export interface SecretsConfiguration {
    readonly jwtSecret?: string;
}

export type MessagingConfiguration = 
    z.infer<typeof messagingSchema>;

export interface ServiceConfiguration {
    readonly service: string;
    readonly environment: Environment;

    readonly logging: LoggingConfiguration;
    readonly observability: ObservabilityConfiguration;

    readonly database: DatabaseConfiguration;
    readonly redis: RedisConfiguration;
    readonly messaging: MessagingConfiguration

    readonly secrets: SecretsConfiguration;

}