import { InfrastructureError } from "@platform/errors";
import { createRedisClient } from "../client/redis-client.js";
import { RedisClient } from "../client/redis-client.js";
import { RedisRuntimeOptions } from "../types/redis-options.js";    

export interface RedisRuntime {
    readonly client: RedisClient,
    readonly shutdown: () => Promise<void>,
};

export async function createRedisRuntime(options:RedisRuntimeOptions): Promise<RedisRuntime> {
    const {config, logger} = options;

    let client: RedisClient;

    try {
        client = createRedisClient(config);
        await client.connect();
        await client.ping();
        logger.info('Redis connection established');
    } catch (error) {
        throw new InfrastructureError(
            'Failed to established redis connection', 
            { cause: error instanceof Error ? error.message : String(error) },
        );
    }

    const shutdown = async (): Promise<void> =>{
        try {
            await client.quit();
            logger.info('Redis connection closed')
        } catch (error) {
            throw new InfrastructureError(
                'Error during redis connection shutdown',
                { cause: error instanceof Error ? error.message : String(error) },
            )
        }
    };
    return { client, shutdown }
}