import { PlatformError } from '../core/platform-error.js';
import { ErrorCodes } from '../core/error-codes.js';

export class ValidationError extends PlatformError {
    readonly code = ErrorCodes.VALIDATION_FAILED;

    constructor(message = 'Validation failed', context?: Record<string, unknown>) {
        super({
            message,
            severity: 'low',
            retryable: false,
            ...(context ? { context } : {}),
        });
    }
}