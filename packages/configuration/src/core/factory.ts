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

/**
 * Transforms flat environment variables (e.g. logging.level) into nested structure
 * Required because dotenv loads everything flat, but our schemas are nested.
 */

const transformEnvironmentVariables = (env: NodeJS.ProcessEnv): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(env)) {
        if (value === undefined) continue;

        const parts = key.split('.');
        let current = result;

        for (let i = 0; i < parts.length - 1; i++) {
            const part: any = parts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part] as Record<string, undefined>;
        }
        const finalKey: any = parts[parts.length - 1];
        current[finalKey] = value;
    }
    return result;
}


export const createServiceConfiguration = <
    T extends z.AnyZodObject,
>({
    service,
    schema,
}: CreateServiceConfigurationOptions<T>) => {
    const rawEnvironment = process.env;
    const transformedEnv = transformEnvironmentVariables(rawEnvironment)
    const mergedSchema =
        mergeConfigurationSchema(schema);

    const result =
        mergedSchema.safeParse(transformedEnv);

    if (!result.success) {
        throw new ConfigurationValidationError(
            'Configuration validation failed',
            service,
            rawEnvironment.NODE_ENV ||
            'unknown',
            result.error.issues,
        );
    }

    const configuration = { ...result.data };

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

    return deepFreeze(configuration) as z.infer<T> & { secrets: any }
};