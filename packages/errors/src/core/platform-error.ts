import type { ErrorCode } from './error-codes.js';
import type { ErrorSeverity } from './error-severity.js';

export abstract class PlatformError extends Error {
    abstract readonly code: ErrorCode;

    readonly retryable: boolean;
    readonly severity: ErrorSeverity;
    readonly context: Record<string, unknown> | undefined;

    protected constructor(params: {
        message: string;
        severity: ErrorSeverity;
        retryable: boolean;
        context?: Record<string, unknown>;
        cause?: Error;
    }) {
        super(params.message);

        this.name = this.constructor.name;

        this.retryable = params.retryable;
        this.severity = params.severity;
        this.context = params.context;

        if (params.cause) {
            this.cause = params.cause;
        }

        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            retryable: this.retryable,
            severity: this.severity,
            context: this.context,
            stack: this.stack,
        };
    }
}