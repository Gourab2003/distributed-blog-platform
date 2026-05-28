import { Redis } from 'ioredis'
import { RedisConfiguration } from '@platform/configuration'

export type RedisClient = Redis;

export function createRedisClinet(config: RedisConfiguration): RedisClient{
    return new Redis(config.url, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 10_000,
        commandTimeout: 50_0,
    });
}