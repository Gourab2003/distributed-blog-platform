import type { MiddlewareHandler } from 'hono';

import type { PlatformLogger } from '@platform/logger';

import { serializeErrorResponse } from '../errors/serialize-error-response.js';

import {
    REQUEST_ID_CONTEXT_KEY,
} from '../context/request-context-keys.js';

interface ErrorHandlerOptions {
    readonly logger: PlatformLogger;
}

export const errorHandlerMiddleware = (
    options: ErrorHandlerOptions,
): MiddlewareHandler => {
    return async (context, next) => {
        try {
            await next();
        } catch (error) {
            const requestId = context.get(
                REQUEST_ID_CONTEXT_KEY,
            ) as string | undefined;

            options.logger.error(
                'Unhandled request error',
                error,
                {
                    ...(requestId
                        ? { requestId }
                        : {}),
                    metadata: {
                        method: context.req.method,
                        path: context.req.path,
                    },
                },
            );

            const response = serializeErrorResponse(
                error,
                {
                    ...(requestId ? { requestId } : {}),
                },
            );

            return context.json(
                response,
                500,
            );
        }
    };
};