import type { PlatformLogger } from '@platform/logger';
import type { RuntimeResource } from './runtime-resource.js';

export interface LifecycleManager {
  readonly register: (resource: RuntimeResource) => void;
  readonly startAll: () => Promise<void>;
  readonly shutdownAll: () => Promise<void>;
}

export function createLifecycleManager(
  logger: PlatformLogger,
): LifecycleManager {
  const resources: RuntimeResource[] = [];

  let isShuttingDown = false;

  return {
    register(resource: RuntimeResource): void {
      resources.push(resource);

      logger.debug(
        `Resource registered for orchestration: ${ resource.name } `,
      );
    },

    async startAll(): Promise<void> {
      logger.info('Executing sequential startup orchestration...');

      const startedResources: RuntimeResource[] = [];

      try {
        for (const resource of resources) {
          if (!resource.start) {
            continue;
          }

          if (resource.state === 'started') {
            logger.warn(
              `Resource already started: ${ resource.name } `,
            );

            continue;
          }

          logger.info(
            `Starting resource: ${ resource.name }...`,
          );

          await resource.start();

          startedResources.push(resource);

          logger.info(
            `Resource startup complete: ${ resource.name } `,
          );
        }

        logger.info(
          'All resources started successfully.',
        );
      } catch (error) {
        logger.error(
          'Startup orchestration failed. Beginning rollback...',
          {
            metadata: {
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
            },
          },
        );

        const reverseStartedResources =
          [...startedResources].reverse();

        for (const resource of reverseStartedResources) {
          try {
            logger.info(
              `Rolling back resource: ${ resource.name } `,
            );

            await resource.shutdown();
          } catch (rollbackError) {
            logger.error(
              `Rollback failed for resource: ${ resource.name } `,
              {
                metadata: {
                  error:
                    rollbackError instanceof Error
                      ? rollbackError.message
                      : String(rollbackError),
                },
              },
            );
          }
        }

        throw error;
      }
    },

    async shutdownAll(): Promise<void> {
      if (isShuttingDown) {
        logger.warn(
          'Shutdown already in progress. Ignoring duplicate request.',
        );

        return;
      }

      isShuttingDown = true;

      logger.info(
        'Executing reverse-sequential graceful shutdown...',
      );

      const reverseResources =
        [...resources].reverse();

      for (const resource of reverseResources) {
        try {
          if (
            resource.state !== 'started' &&
            resource.state !== 'starting'
          ) {
            continue;
          }

          logger.info(
            `Shutting down resource: ${ resource.name }...`,
          );

          await resource.shutdown();

          logger.info(
            `Resource shutdown complete: ${ resource.name } `,
          );
        } catch (error) {
          logger.error(
            `Failed to cleanly shutdown resource: ${ resource.name } `,
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
      }

      logger.info(
        'Graceful shutdown sequence completed.',
      );
    },
  };
}
