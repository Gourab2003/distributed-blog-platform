import type { LogContext } from './log-context.js';

export interface PlatformLogger {
    trace(message: string, context?: LogContext): void;

    debug(message: string, context?: LogContext): void;

    info(message: string, context?: LogContext): void;

    warn(message: string, context?: LogContext): void;

    error(
        message: string,
        error?: unknown,
        context?: LogContext,
    ): void;

    fatal(
        message: string,
        error?: unknown,
        context?: LogContext,
    ): void;

    withContext(context: LogContext): PlatformLogger;
}