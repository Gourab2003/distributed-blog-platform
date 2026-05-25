import { z } from 'zod';

export const environmentEnum = z.enum([
    'development',
    'test',
    'staging',
    'production',
]);

export type Environment = z.infer<
    typeof environmentEnum
>;

export const environmentSchema = z
    .object({
        environment: environmentEnum,

        service: z.string().min(1),

        runtime: z
            .object({
                nodeVersion: z.string().optional(),
                platform: z.string().optional(),
            })
            .strict(),
    })
    .strict();

export type EnvironmentConfiguration =
    z.infer<typeof environmentSchema>;