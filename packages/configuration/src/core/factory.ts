import { z } from 'zod';
import { deepFreeze } from './deep-freeze.js';
import { mergeConfigurationSchema } from './schema.js';
import { ConfigurationValidationError } from './errors.js';

type CreateServiceConfigurationOptions<T extends z.AnyZodObject> = {
    service: string;
    schema: T;
};

const transformEnvironmentVariables = (env: NodeJS.ProcessEnv): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, rawValue] of Object.entries(env)) {
        if (rawValue === undefined || rawValue === '') continue;

        // Only accept our configuration keys (top-level or dotted)
        if (!key.includes('.') && key !== 'environment' && key !== 'service') {
            continue;
        }

        const parts = key.split('.');
        let current: Record<string, unknown> = result;

        for (let i = 0; i < parts.length - 1; i++) {
            const part:any = parts[i];
            if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
                current[part] = {};
            }
            current = current[part] as Record<string, unknown>;
        }

        const finalKey = parts.at(-1);
        if(!finalKey){
            continue;
        }
        const value = rawValue.trim();

        // Smart type coercion
        if (value === 'true') {
            current[finalKey] = true;
        } else if (value === 'false') {
            current[finalKey] = false;
        } else {
            current[finalKey] = value;
        }
    }

    return result;
};

export const createServiceConfiguration = <T extends z.AnyZodObject>({
    service,
    schema,
}: CreateServiceConfigurationOptions<T>) => {
    const rawEnvironment = process.env;
    const transformedEnv = transformEnvironmentVariables(rawEnvironment);

    // console.dir(transformedEnv, { depth: null });

    const mergedSchema = mergeConfigurationSchema(schema);

    const result = mergedSchema.safeParse(transformedEnv);

    if (!result.success) {
        throw new ConfigurationValidationError(
            'Configuration validation failed',
            service,
            rawEnvironment.NODE_ENV || 'unknown',
            result.error.issues,
        );
    }

    const config = { ...result.data };

    if (config.secrets) {
        Object.defineProperty(config, 'secrets', {
            value: config.secrets,
            writable: false,
            configurable: false,
            enumerable: false,
        });
    }

    return deepFreeze(config) as z.infer<typeof mergedSchema>;
};