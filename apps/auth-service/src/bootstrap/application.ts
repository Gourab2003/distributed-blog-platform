import { serve } from "@hono/node-server";
import { configuration } from "../config/index.js";
import { runtime } from "./runtime.js";
import { createHttpApp } from "./create-http-app.js";


export const bootstrapApplication = async (): Promise<void> => {
    const app = createHttpApp();

    serve({
        fetch: app.fetch,
        port: configuration.port,
    });

    runtime.logger.info('Auth service started', {
        metadata: {
            service: configuration.service,
            environment: configuration.environment,
            port: configuration.port,
        },
    });

    const shutdown = async (
        signal: string,
    ): Promise<void> => {
        runtime.logger.warn( 'Shutting down auth service', {
            metadata: {
                signal
            }
        } );

        process.on(
            'SIGINT',
            () => void shutdown('SIGINT'),
        );

        process.on(
            'SIGTERM',
            () => void shutdown('SIGTERM'),
        );
    }
};

// Future initialization points:
// - Logger
// - Database
// - Redis
// - Observability