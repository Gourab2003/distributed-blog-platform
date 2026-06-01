import { z } from 'zod';
export const uuidSchema = z.string().uuid({ message: 'Invalid identifier format' });
export const isoDataSchema = z.string().datetime({ message: 'Invalid ISO date format' });
export const cursorSchema = z.string().trim().min(1, { message: 'Cursor must not be empty' });
export const limitSchema = z.coerce.number().int().min(1).max(100).default(20);
export const cursorPaginationSchema = z.object({
    cursor: cursorSchema.optional(),
    limit: limitSchema,
}).strict();
export const emailSchema = z
    .string()
    .trim()
    .email({ message: 'Invalid email address' }).toLowerCase();
export const passwordSchema = z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 char' })
    .max(72, { message: 'Password must not exceed 72 char' });
export const BLOG_POST_STATUSES = [
    'draft',
    'published',
    'archived'
];
export const blogPostStatusSchema = z.enum(BLOG_POST_STATUSES);
export const USER_ROLES = [
    'admin',
    'author',
    'user',
];
export const userRoleSchema = z.enum(USER_ROLES);
//# sourceMappingURL=index.js.map