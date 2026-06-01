import type { PlatformLogger } from '@platform/logger';
import type { LifecycleManager } from '../lifecycle/lifecycle-manager.js';

export function registerProcessSignals(
  manager: LifecycleManager,
  logger: PlatformLogger,
  timeoutMs = 10000,
): void {
  const handleShutdown = async (
    reason: string,
    exitCode: number,
  ): Promise<void> => {
    logger.info(
      `Process shutdown initiated.Reason: ${ reason } `,
    );

    const forceExitTimer = setTimeout(() => {
      logger.error(
        `Shutdown timeout exceeded(${ timeoutMs }ms).Forcing exit.`,
      );

      process.exit(exitCode);
    }, timeoutMs);

    forceExitTimer.unref();

    try {
      await manager.shutdownAll();

      logger.info(
        'Process lifecycle shutdown completed.',
      );

      process.exitCode = exitCode;
    } catch (error) {
      logger.error(
        'Critical failure during shutdown orchestration',
        {
          metadata: {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
        },
      );

      process.exitCode = 1;
    }
  };

  process.once('SIGINT', () => {
    void handleShutdown('SIGINT', 0);
  });

  process.once('SIGTERM', () => {
    void handleShutdown('SIGTERM', 0);
  });

  process.once(
    'uncaughtException',
    async (error) => {
      logger.error(
        'Uncaught exception detected',
        {
          metadata: {
            error:
              error instanceof Error
                ? error.message
                : String(error),

            stack:
              error instanceof Error
                ? error.stack
                : undefined,
          },
        },
      );

      await handleShutdown(
        'uncaughtException',
        1,
      );
    },
  );

  process.once(
    'unhandledRejection',
    async (reason) => {
      logger.error(
        'Unhandled promise rejection detected',
        {
          metadata: {
            reason: String(reason),
          },
        },
      );

      await handleShutdown(
        'unhandledRejection',
        1,
      );
    },
  );
}