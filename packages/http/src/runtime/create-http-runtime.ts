import type { PlatformLogger } from '@platform/logger';
import type { HttpApp } from '../types/http-app.js';

import { requestIdMiddleware } from '../middleware/request-id.middleware.js';
import { requestTimingMiddleware } from '../middleware/request-timing.middleware.js';
import { errorHandlerMiddleware } from '../middleware/error-handler.middleware.js';

export interface HttpRuntimeOptions {
    readonly app: HttpApp;
    readonly logger: PlatformLogger;
    readonly serviceName: string;
}

export const createHttpRuntime = (
    options: HttpRuntimeOptions,
): HttpApp => {
    const { app, logger } = options;

    app.use('*', requestIdMiddleware());
    app.use('*', requestTimingMiddleware());

    app.use('*', errorHandlerMiddleware({
        logger,
    }));

    return app;
};