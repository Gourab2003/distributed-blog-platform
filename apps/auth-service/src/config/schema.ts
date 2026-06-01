import { z } from 'zod';

export const authServiceSchema = z.object({
    port: z.coerce.number().int().min(1).max(65535).default(3001),
    auth: z.object({
        jwtIssuer: z.string().min(1),
        jwtAudience: z.string().min(1),
        accessTokenTtl: z.string().min(1),
        refreshTokenTtl: z.string().min(1),
    }).strict(),
    
}).strict();

export type authServiceConfiguration = z.infer<typeof authServiceSchema>;