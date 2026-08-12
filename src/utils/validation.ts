import { z } from 'zod';

// ── Common Fields ────────────────────────────────────────────────────────────

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
  .email({ message: 'Invalid email address' })
  .toLowerCase();

export const passwordSchema = z
  .string()
  .trim()
  .min(8, { message: 'Password must be at least 8 char' })
  .max(72, { message: 'Password must not exceed 72 char' });

// ── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}).strict();

export const registerSchema = z.object({
  email: emailSchema,
  userName: z.string().min(3).max(30).trim().regex(/^[a-zA-Z0-9_-]+$/, {
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

// ── Blog Post Schemas ────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }).max(255),
  content: z.string().min(1, { message: 'Content is required' }),
}).strict();

export const updatePostSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
}).strict();

// ── Comment Schemas ──────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, { message: 'Comment content cannot be empty' }),
  parentCommentId: uuidSchema.optional(),
}).strict();

// ── User Profile Schemas ──────────────────────────────────────────────────────

import { ValidationError } from './errors.js';

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
}).strict();

export function validateRequest<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message ?? 'Validation failed';

    throw new ValidationError(message, {
      fieldErrors: result.error.flatten().fieldErrors,
    });
  }

  return result.data as z.infer<TSchema>;
}

