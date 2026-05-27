import type { MiddlewareHandler } from 'hono';

import {
    RequestContextKeys,
} from '../context/request-context-keys.js';

export const requestTimingMiddleware = (): MiddlewareHandler => {
    return async (context, next) => {
        context.set(
            RequestContextKeys.START_TIME,
            performance.now(),
        );

        await next();
    };
};