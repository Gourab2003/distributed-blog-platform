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

      for (const resource of resources) {
        if (!resource.start) {
          continue;
        }

        logger.info(`Starting resource: ${ resource.name }...`);

        try {
          await resource.start();

          logger.info(
            `Resource startup complete: ${ resource.name } `,
          );
        } catch (error) {
          logger.error(
            `Fatal error during startup of ${ resource.name } `,
            {
              metadata: {
                error:
                  error instanceof Error
                    ? error.message
                    : String(error),
              },
            }
          );

          throw error;
        }
      }

      logger.info('All resources started successfully.');
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

      const reverseResources = [...resources].reverse();

      for (const resource of reverseResources) {
        try {
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
            }
          );
        }
      }

      logger.info(
        'Graceful shutdown sequence completed.',
      );
    },
  };
}
