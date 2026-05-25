import { PlatformError } from "../core/platform-error.js";
import { ErrorCodes } from "../core/error-codes.js";

export class AuthenticationError extends PlatformError {
    readonly code = ErrorCodes.AUTHENTICATION_FAILED;

    constructor(message = 'Authentication failed', context?: Record<string, unknown>) {
        super({
            message,
            severity: 'medium',
            retryable: false,
            ...(context ? { context } : {}),
        })
    }
}