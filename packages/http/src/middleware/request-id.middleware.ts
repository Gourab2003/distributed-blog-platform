import { randomUUID } from 'node:crypto';

import type { MiddlewareHandler } from 'hono';

import {
    RequestContextKeys ,
} from '../context/request-context-keys.js';

const REQUEST_ID_HEADER = 'x-request-id';

export const requestIdMiddleware = (): MiddlewareHandler => {
    return async (context, next) => {
        const existingRequestId =
            context.req.header(REQUEST_ID_HEADER);

        const requestId =
            existingRequestId || randomUUID();

        context.set(
            RequestContextKeys.REQUEST_ID ,
            requestId,
        );

        context.header(
            REQUEST_ID_HEADER,
            requestId,
        );

        await next();
    };
};