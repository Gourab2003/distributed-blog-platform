import { PlatformError } from '../core/platform-error.js';
import { ErrorCodes } from '../core/error-codes.js';

export class NotFoundError extends PlatformError {
    readonly code = ErrorCodes.RESOURCE_NOT_FOUND;

    constructor(resource: string, context?: Record<string, unknown>) {
        super({
            message: `${resource} not found`,
            severity: 'low',
            retryable: false,
            ...(context ? { context } : {}),
        });
    }
}