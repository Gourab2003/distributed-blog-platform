// Validation layer — transport validators only.
// Business rules (uniqueness, authorization, domain invariants) belong in the service layer.


import {z} from 'zod';
import { emailSchema, passwordSchema } from '../common/index.js';


export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
}).strict();

export const registerSchema = z.object({
    email: emailSchema,
    userName: z.string().min(3).max(30).trim().regex(/^[a-zA-Z0-9_-]+$/,{
        message: 'Username may only contain letters, numbers, underscores, and hyphens'
    }),
    password: passwordSchema,
}).strict();

export const refreshTokenSchema = z.object({
    refreshToken: z.string().trim().min(1, { message: 'Refresh token is required' }),
}).strict();

export const logoutSchema = z.object({
    refreshToken: z.string().trim().min(1, { message: 'Refresh token is required' }),
}).strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;