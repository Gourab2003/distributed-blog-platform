import { z } from 'zod';

export const messagingSchema = z.object({
    url: z.string().min(1),

    prefetchCount: z.coerce
        .number()
        .int()
        .min(1)
        .default(10),

    reconnectIntervalMs: z.coerce
        .number()
        .int()
        .min(100)
        .default(5000),
}).strict();

export type MessagingConfiguration =
    z.infer<typeof messagingSchema>;