import 'dotenv/config';
import { createLogger } from '@platform/logger';
import { initObservability } from '@platform/observability';
import { createDatabaseRuntime } from '@platform/database';
import { createRedisRuntime } from '@platform/redis';
import { createLifecycleManager, registerProcessSignals } from '@platform/runtime';
import { configuration } from './config/index.js';
import { createHttpApp } from './bootstrap/create-http-app.js';
import { createHttpRuntime } from './runtime/http-runtime.js';

async function main(): Promise<void> {
    const logger = createLogger(configuration.logging);
    initObservability(configuration.observability);

    try {
        const lifecycle = createLifecycleManager(logger);

        const dbRuntime = createDatabaseRuntime({
            config: configuration.database,
            logger,
        });

        const redisRuntime = createRedisRuntime({
            config: configuration.redis,
            logger,
        });

        const app = createHttpApp({
            dbRuntime,
            redisRuntime,
            logger,
        });

        const httpRuntime = createHttpRuntime({
            app,
            port: configuration.port,
            logger,
        });

        lifecycle.register(dbRuntime);
        lifecycle.register(redisRuntime);
        lifecycle.register(httpRuntime);

        registerProcessSignals(lifecycle, logger);

        await lifecycle.startAll();

        logger.info('auth-service ready', {
            metadata: {
                port: configuration.port,
                environment: configuration.environment,
            },
        });
    } catch (error) {
        console.error('Fatal failure during bootstrap', error);
        process.exit(1);
    }
}

main().catch((error: unknown) => {
    console.error('Unhandled error in main', error);
    process.exit(1);
});