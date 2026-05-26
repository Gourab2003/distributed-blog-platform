import { z } from 'zod';

export const databaseSchema = z.object({
    url: z.string().min(1),
    pool: z.object({
        min: z.coerce.number().int().min(0).default(2),
        max: z.coerce.number().int().min(1).default(10),
    }).strict(),
    ssl: z.boolean().default(false),
}).strict();

export type DatabaseConfiguration = z.infer<typeof databaseSchema>;