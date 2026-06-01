import { z } from 'zod';
import { cursorPaginationSchema, userRoleSchema } from '../common/index.js';
export const updateUserSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username may only contain letters, numbers, underscores, and hyphens',
    })
        .optional(),
    role: userRoleSchema.optional(),
}).strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});
export const getUsersQuerySchema = cursorPaginationSchema;
//# sourceMappingURL=index.js.map