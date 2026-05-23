import type { ErrorCode } from './error-codes.js';
import type { ErrorSeverity } from './error-severity.js';

export abstract class PlatformError extends Error {
    abstract readonly code: ErrorCode;

    readonly retryable: boolean;
    readonly severity: ErrorSeverity;
    readonly context: Record<string, unknown> | undefined;

    protected constructor(params: {
        message: string;
        retryable?: boolean;
        severity?: ErrorSeverity;
        context?: Record<string, unknown>;
        cause?: Error;
    }) {
        super(params.message);

        this.name = this.constructor.name;

        this.retryable = params.retryable ?? false;
        this.severity = params.severity ?? 'medium';
        this.context = params.context;

        if (params.cause) {
            this.cause = params.cause;
        }
    }
}