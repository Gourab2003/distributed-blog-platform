import { z } from 'zod';

export const observabilitySchema = z.object({
    enabled: z.boolean().default(true),
    serviceName: z.string().min(1),
    sampleRate: z.number().min(0).max(1).default(1.0),
    otelExporterUrl: z.string().url().optional(),
}).strict();

export type ObservabilityConfiguration = z.infer<typeof observabilitySchema>;