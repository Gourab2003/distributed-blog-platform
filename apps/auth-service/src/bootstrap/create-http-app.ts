import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { createHttpRuntime as createPlatformHttpRuntime } from '@platform/http';
import type { HttpVariables } from '@platform/http';
import type { PlatformLogger } from '@platform/logger';
import type { DatabaseRuntime } from '@platform/database';
import type { RedisRuntime } from '@platform/redis';
import { registerHealthRoutes } from '../routes/health.route.js';
import { registerAuthRoutes } from '../routes/auth.route.js';

export type AppVariables = HttpVariables & {
    readonly getDb: () => DatabaseRuntime['db'];
    readonly getRedis: () => RedisRuntime['client'];
};

export interface HttpAppOptions {
    readonly dbRuntime: DatabaseRuntime;
    readonly redisRuntime: RedisRuntime;
    readonly logger: PlatformLogger;
}

export function createHttpApp(options: HttpAppOptions): OpenAPIHono<{ Variables: AppVariables }> {
    const app = new OpenAPIHono<{ Variables: AppVariables }>();

    app.use('*', async (c, next) => {
        c.set('getDb', () => options.dbRuntime.db);
        c.set('getRedis', () => options.redisRuntime.client);
        await next();
    });

    createPlatformHttpRuntime({
        app: app as never,
        logger: options.logger,
        serviceName: 'auth-service',
    });


    app.doc('/openapi.json', {
        openapi: '3.0.0',
        info: {
            title: 'Auth Service API',
            version: '1.0.0',
            description: 'Authentication and session management',
        },
    });

    app.get('/docs', swaggerUI({ url: '/openapi.json' }));

    registerHealthRoutes(app as never);
    registerAuthRoutes(app as never);

    return app;
}