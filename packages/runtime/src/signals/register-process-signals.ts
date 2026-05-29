import type { PlatformLogger } from '@platform/logger';
import type { LifecycleManager } from '../lifecycle/lifecycle-manager.js';

export interface ProcessSignalHandlers {
  readonly shutdown: (signal: string) => Promise<void>;
}

export function registerProcessSignals(
  manager: LifecycleManager,
  logger: PlatformLogger,
): ProcessSignalHandlers {
  const shutdown = async (
    signal: string,
  ): Promise<void> => {
    logger.info(
      `Process received ${ signal }. Beginning graceful shutdown...`,
    );

    try {
      await manager.shutdownAll();

      logger.info(
        'Process lifecycle shutdown completed successfully.',
      );
    } catch (error) {
      logger.error(
        'Critical failure during shutdown orchestration',
        {
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
      );

      throw error;
    }
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  return {
    shutdown,
  };
}