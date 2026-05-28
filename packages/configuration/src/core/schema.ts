import { z } from 'zod';

import { environmentSchema } from '../environment/schema.js';
import { loggingSchema } from '../logging/schema.js';
import { observabilitySchema } from '../observability/schema.js';
import { databaseSchema } from '../database/schema.js';
import { redisSchema } from '../redis/schema.js';
import { secretsSchema } from '../secrets/schema.js';
import { messagingSchema } from '../messaging/schema.js';

export const baseConfigurationSchema =
    z.object({
        environment:
            environmentSchema.shape
                .environment,

        service:
            environmentSchema.shape
                .service,

        runtime:
            environmentSchema.shape
                .runtime,

        logging:
            loggingSchema,

        observability:
            observabilitySchema,

        database:
            databaseSchema,

        redis:
            redisSchema,

        messaging:
            messagingSchema,

    }).strict();

export type BaseConfiguration =
    z.infer<
        typeof baseConfigurationSchema
    >;

export const mergeConfigurationSchema =
    <T extends z.AnyZodObject>(
        serviceSchema: T,
    ) => {
        return baseConfigurationSchema
            .extend({
                secrets:
                    secretsSchema,

                ...serviceSchema.shape,
            })
            .strict();
    };