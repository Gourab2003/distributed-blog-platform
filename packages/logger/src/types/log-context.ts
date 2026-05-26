import type { LogMetadata } from './log-metadata.js';

export interface LogContext {
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly traceId?: string;
    readonly spanId?: string;
    readonly userId?: string;
    readonly metadata?: LogMetadata;
}