import type { MiddlewareHandler } from 'hono';

import {
    REQUEST_START_TIME_CONTEXT_KEY,
} from '../context/request-context-keys.js';

export const requestTimingMiddleware = (): MiddlewareHandler => {
    return async (context, next) => {
        context.set(
            REQUEST_START_TIME_CONTEXT_KEY,
            performance.now(),
        );

        await next();
    };
};