import { ErrorCodes } from "../core/error-codes.js";
import { PlatformError } from "../core/platform-error.js";


export class AuthorizationError extends PlatformError {
    readonly code = ErrorCodes.AUTHORIZATION_FAILED;

    constructor (message = 'Authorization failed', context?: Record<string, unknown>){
        super({
            message,
            severity: 'high',
            retryable: false,
            ...(context ? {context} : {}),
        })
    }
}