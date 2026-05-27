import type { PlatformLogger } from '@platform/logger';

export interface HttpVariables {
    requestId: string;
    correlationId: string;
    startTime: number;

    logger: PlatformLogger;
}