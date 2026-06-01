import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import type { ApiErrorResponse, ApiSuccessResponse } from '@platform/http';

const errorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
    }),
}) satisfies z.ZodType<ApiErrorResponse>;

const tokenPairResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.string(),
    }),
}) satisfies z.ZodType<ApiSuccessResponse<{
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}>>;

const logoutResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        message: z.string(),
    }),
}) satisfies z.ZodType<ApiSuccessResponse<{ message: string }>>;


//--------Route Definition------------//


export const registerRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/register',
    tags: ['Authentication'],
    summary: 'Register a new user account',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        email: z.string().email(),
                        userName: z.string().min(3).max(30),
                        password: z.string().min(8),
                    }),
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User registerd successfully',
            content: {
                'application/json' : {
                    schema: tokenPairResponseSchema,
                },
            },
        },
        409: {
            description: 'Email or username already in use',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
        422: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});

export const loginRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/login',
    tags: ['Authentication'],
    summary: 'Authenticate with email and password',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        email: z.string().email(),
                        password: z.string().min(1),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Authentication successful',
            content: {
                'application/json': {
                    schema: tokenPairResponseSchema,
                },
            },
        },
        401: {
            description: 'Invalid credentials',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
        422: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});

export const refreshRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/refresh',
    tags: ['Authentication'],
    summary: 'Rotate refresh token and issue new access token',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        refreshToken: z.string().min(1),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Tokens rotated successfully',
            content: {
                'application/json': {
                    schema: tokenPairResponseSchema,
                },
            },
        },
        401: {
            description: 'Invalid or expired refresh token',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
        422: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});

export const logoutRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/logout',
    tags: ['Authentication'],
    summary: 'Invalidate refresh token and end session',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        refreshToken: z.string().min(1),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Logged out successfully',
            content: {
                'application/json': {
                    schema: logoutResponseSchema,
                },
            },
        },
        422: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});