import { z } from 'zod';

export const redisSchema = z.object({
    url: z.string().min(1),
    keyPrefix: z.string().default('blog:'),
    ttl: z.number().int().min(0).default(3600),
}).strict();

export type RedisConfiguration = z.infer<typeof redisSchema>;