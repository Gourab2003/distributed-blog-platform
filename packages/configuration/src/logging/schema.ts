import { z } from 'zod';

export const loggingSchema = z.object({
    level: z.enum(['error', 'warn', 'info', 'debug', 'trace']),
    format: z.enum(['json', 'pretty']),
    enabled: z.boolean().default(true),
}).strict();

export type LoggingConfiguration = z.infer<typeof loggingSchema>;