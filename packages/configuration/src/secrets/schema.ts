import { z } from 'zod';

export const secretsSchema = z.object({
    jwt: z.object({
        secret: z.string().min(32),
        refreshSecret: z.string().min(32).optional(),
    }).strict(),
    database: z.object({
        password: z.string().min(1),
    }).strict(),
}).strict();

export type SecretsConfiguration = z.infer<typeof secretsSchema>;