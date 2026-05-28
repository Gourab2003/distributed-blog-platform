import type { RedisConfiguration } from '@platform/configuration';
import type { PlatformLogger } from '@platform/logger';

export interface RedisRuntimeOptions {
    readonly config: RedisConfiguration;
    readonly logger: PlatformLogger
};