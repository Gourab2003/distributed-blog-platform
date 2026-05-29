import { InfrastructureError } from "@platform/errors";
import type { RuntimeResource, RuntimeState } from "@platform/runtime";
import { createRedisClient } from "../client/redis-client.js";
import type { RedisClient } from "../client/redis-client.js";
import type { RedisRuntimeOptions } from "../types/redis-options.js";

export interface RedisRuntime extends RuntimeResource {
    readonly client: RedisClient;
}

export function createRedisRuntime(options: RedisRuntimeOptions): RedisRuntime {
    const { config, logger } = options;

    let _client: RedisClient | null = null;
    let state: RuntimeState = 'idle';

    return {
        name: 'redis',

        get state(): RuntimeState {
            return state;
        },

        get client(): RedisClient {
            if (!_client) {
                throw new InfrastructureError('Redis accessed before initialization');
            }
            return _client;
        },

        async start(): Promise<void> {
            if (state !== 'idle') return;
            state = 'starting';

            try {
                _client = createRedisClient(config);
                await _client.connect();
                await _client.ping();
                logger.info('Redis connection established');
                state = 'started';
            } catch (error) {
                state = 'stopped';
                throw new InfrastructureError('Failed to establish redis connection', {
                    cause: error instanceof Error ? error.message : String(error)
                });
            }
        },

        async shutdown(): Promise<void> {
            if (state === 'idle' || state === 'stopped') return;
            state = 'shutting-down';

            try {
                if (_client) {
                    await _client.quit();
                }
                logger.info('Redis connection closed');
                state = 'stopped';
            } catch (error) {
                state = 'stopped';
                logger.error('Error during redis connection shutdown', {
                    metadata: {
                        error: error instanceof Error ? error.message : String(error)
                    }
                });
            }
        }
    };
}