import { z } from 'zod';
import { cursorPaginationSchema, uuidSchema, blogPostStatusSchema, } from '../common/index.js';
export const createBlogPostSchema = z
    .object({
    title: z
        .string()
        .trim()
        .min(3, { message: 'Title must be at least 3 characters' })
        .max(200, { message: 'Title must not exceed 200 characters' }),
    content: z
        .string()
        .min(1, { message: 'Content must not be empty' })
        .max(50000, { message: 'Content must not exceed 50000 characters' }),
    summary: z
        .string()
        .trim()
        .max(500, { message: 'Summary must not exceed 500 characters' })
        .optional(),
    tags: z
        .array(z
        .string()
        .trim()
        .min(1, { message: 'Tag must not be empty' })
        .max(50, { message: 'Tag must not exceed 50 characters' }))
        .max(10, { message: 'Cannot exceed 10 tags' })
        .optional(),
})
    .strict();
export const updateBlogPostSchema = z
    .object({
    title: z
        .string()
        .trim()
        .min(3, { message: 'Title must be at least 3 characters' })
        .max(200, { message: 'Title must not exceed 200 characters' })
        .optional(),
    content: z
        .string()
        .min(1, { message: 'Content must not be empty' })
        .max(50000, { message: 'Content must not exceed 50000 characters' })
        .optional(),
    summary: z
        .string()
        .trim()
        .max(500, { message: 'Summary must not exceed 500 characters' })
        .optional(),
    tags: z
        .array(z
        .string()
        .trim()
        .min(1, { message: 'Tag must not be empty' })
        .max(50, { message: 'Tag must not exceed 50 characters' }))
        .max(10, { message: 'Cannot exceed 10 tags' })
        .optional(),
    status: blogPostStatusSchema.optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});
export const getBlogPostsQuerySchema = cursorPaginationSchema
    .extend({
    authorId: uuidSchema.optional(),
    status: blogPostStatusSchema.optional(),
    tag: z
        .string()
        .trim()
        .max(50, { message: 'Tag must not exceed 50 characters' })
        .optional(),
})
    .strict();
//# sourceMappingURL=index.js.map