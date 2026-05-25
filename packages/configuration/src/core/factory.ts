import { z } from 'zod';

import { deepFreeze } from './deep-freeze.js';
import { mergeConfigurationSchema } from './schema.js';
import { ConfigurationValidationError } from './errors.js';

type CreateServiceConfigurationOptions<
    T extends z.AnyZodObject,
> = {
    service: string;
    schema: T;
};

export const createServiceConfiguration = <
    T extends z.AnyZodObject,
>({
    service,
    schema,
}: CreateServiceConfigurationOptions<T>) => {
    const rawEnvironment = process.env;

    const mergedSchema =
        mergeConfigurationSchema(schema);

    const result =
        mergedSchema.safeParse(rawEnvironment);

    if (!result.success) {
        throw new ConfigurationValidationError(
            'Configuration validation failed',
            service,
            rawEnvironment.NODE_ENV ||
            'unknown',
            result.error.issues,
        );
    }

    const configuration = result.data;

    if (configuration.secrets) {
        Object.defineProperty(
            configuration,
            'secrets',
            {
                value: configuration.secrets,
                writable: false,
                configurable: false,
                enumerable: false,
            },
        );
    }

    return deepFreeze(configuration);
};