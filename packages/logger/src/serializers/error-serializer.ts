import { PlatformError } from '@platform/errors';

export const serializeError = (
    error: unknown,
): Record<string, unknown> => {
    if (error instanceof PlatformError) {
        return {
            name: error.name,
            message: error.message,
            code: error.code,
            severity: error.severity,
            retryable: error.retryable,
            context: error.context,
            stack: error.stack,
        };
    }

    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return {
        message: String(error),
    };
};