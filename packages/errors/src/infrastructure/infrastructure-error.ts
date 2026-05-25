import { PlatformError } from '../core/platform-error.js';
import { ErrorCodes } from '../core/error-codes.js';

export class InfrastructureError extends PlatformError {
    readonly code = ErrorCodes.INFRASTRUCTURE_FAILURE;

    constructor(message = 'Infrastructure failure', context?: Record<string, unknown>) {
        super({
            message,
            severity: 'critical',
            retryable: true,
            ...(context ? { context } : {}),
        });
    }
}