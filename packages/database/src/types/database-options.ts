import type { DatabaseConfiguration } from '@platform/configuration';
import type { PlatformLogger } from '@platform/logger';

export interface DatabaseRuntimeOptions {
    readonly config: DatabaseConfiguration;
    readonly logger: PlatformLogger;
}