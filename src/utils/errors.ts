export const ErrorCodes = {
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INFRASTRUCTURE_FAILURE: 'INFRASTRUCTURE_FAILURE',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical' | 'fatal';

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

export class AuthenticationError extends PlatformError {
  readonly code = ErrorCodes.AUTHENTICATION_FAILED;
  constructor(message = 'Authentication failed', context?: Record<string, unknown>) {
    super({
      message,
      severity: 'medium',
      retryable: false,
      ...(context ? { context } : {}),
    });
  }
}

export class AuthorizationError extends PlatformError {
  readonly code = ErrorCodes.AUTHORIZATION_FAILED;
  constructor(message = 'Authorization failed', context?: Record<string, unknown>) {
    super({
      message,
      severity: 'high',
      retryable: false,
      ...(context ? { context } : {}),
    });
  }
}

export class NotFoundError extends PlatformError {
  readonly code = ErrorCodes.RESOURCE_NOT_FOUND;
  constructor(message = 'Resource not found', context?: Record<string, unknown>) {
    super({
      message,
      severity: 'low',
      retryable: false,
      ...(context ? { context } : {}),
    });
  }
}

export class InfrastructureError extends PlatformError {
  readonly code = ErrorCodes.INFRASTRUCTURE_FAILURE;
  constructor(message = 'Infrastructure failure', params?: { cause?: Error; context?: Record<string, unknown> }) {
    super({
      message,
      severity: 'high',
      retryable: true,
      cause: params?.cause,
      context: params?.context,
    });
  }
}

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
