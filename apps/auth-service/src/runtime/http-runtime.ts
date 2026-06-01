import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { Socket } from 'node:net';

import { getRequestListener } from '@hono/node-server';
import type { Hono } from 'hono';

import type { PlatformLogger } from '@platform/logger';
import type {
  RuntimeResource,
  RuntimeState,
} from '@platform/runtime';

export interface HttpRuntimeOptions {
  readonly app: Hono<any, any, any>;
  readonly port: number;
  readonly logger: PlatformLogger;
}

export interface HttpRuntime extends RuntimeResource {
  readonly app: Hono<any, any, any>;
}

export function createHttpRuntime(
  options: HttpRuntimeOptions,
): HttpRuntime {
  const {
    app,
    port,
    logger,
  } = options;

  const connections = new Set<Socket>();

  let state: RuntimeState = 'idle';

  let server: Server | null = null;

  return {
    name: 'http-server',

    get state(): RuntimeState {
      return state;
    },

    app,

    async start(): Promise<void> {
      if (state !== 'idle') {
        return;
      }

      state = 'starting';

      try {
        const requestListener = getRequestListener(
          app.fetch,
        );

        server = createServer(requestListener);

        /**
         * Prevent keep-alive hanging
         * and basic slowloris attacks.
         */
        server.keepAliveTimeout = 5000;
        server.headersTimeout = 6000;

        /**
         * Track sockets so we can
         * forcefully destroy them during
         * shutdown if needed.
         */
        server.on(
          'connection',
          (socket: Socket) => {
            connections.add(socket);

            socket.once('close', () => {
              connections.delete(socket);
            });
          },
        );

        await new Promise<void>(
          (resolve, reject) => {
            const startupErrorHandler = (
              error: Error,
            ) => {
              logger.error(
                'Failed to start HTTP server',
                {
                  metadata: {
                    error: error.message,
                  },
                },
              );

              reject(error);
            };

            server!.once(
              'error',
              startupErrorHandler,
            );

            server!.listen(port, () => {
              server!.off(
                'error',
                startupErrorHandler,
              );

              resolve();
            });
          },
        );

        state = 'started';

        logger.info(
          `HTTP server listening on port ${ port } `,
        );
      } catch (error) {
        state = 'stopped';

        throw error;
      }
    },

    async shutdown(): Promise<void> {
      if (
        state === 'idle' ||
        state === 'stopped'
      ) {
        return;
      }

      state = 'shutting-down';

      logger.info(
        'HTTP server graceful shutdown initiated',
      );

      try {
        if (!server) {
          state = 'stopped';

          return;
        }

        await new Promise<void>(
          (resolve, reject) => {
            server!.close((error) => {
              if (error) {
                return reject(error);
              }

              resolve();
            });
          },
        );

        /**
         * Force kill dangling keep-alive sockets.
         */
        if (connections.size > 0) {
          logger.warn(
            `Destroying ${ connections.size } dangling sockets`,
          );

          for (const socket of connections) {
            socket.destroy();
          }

          connections.clear();
        }

        state = 'stopped';

        logger.info(
          'HTTP server shutdown completed',
        );
      } catch (error) {
        state = 'stopped';

        logger.error(
          'Error during HTTP server shutdown',
          {
            metadata: {
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
            },
          },
        );
      }
    },
  };
}