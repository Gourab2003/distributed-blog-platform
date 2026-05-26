import { PlatformError } from '@platform/errors';

import type { ApiErrorResponse } from '../types/api-error-response.js';

interface SerializeErrorOptions {
    readonly requestId?: string;
    readonly exposeStack?: boolean;
}

export const serializeErrorResponse = (
    error: unknown,
    options?: SerializeErrorOptions,
): ApiErrorResponse => {
    if (error instanceof PlatformError) {
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                ...(options?.requestId
                    ? { requestId: options.requestId }
                    : {}),
            },
        };
    }

    return {
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
            ...(options?.requestId
                ? { requestId: options.requestId }
                : {}),
        },
    };
};