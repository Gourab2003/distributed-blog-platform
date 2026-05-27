import type { PlatformLogger } from '@platform/logger';

export interface ObservabilityOptions {
    readonly serviceName: string;
    readonly environment: string;
    readonly logger: PlatformLogger;
}