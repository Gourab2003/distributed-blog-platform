export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly message?: string;
  readonly meta?: {
    readonly requestId?: string;
    readonly timestamp?: string;
    readonly durationMs?: number;
  };
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly requestId?: string;
  };
}

export const createSuccessResponse = <T>(
  data: T,
  options?: { message?: string; requestId?: string; durationMs?: number }
): ApiSuccessResponse<T> => {
  return {
    success: true,
    data,
    ...(options?.message ? { message: options.message } : {}),
    meta: {
      ...(options?.requestId ? { requestId: options.requestId } : {}),
      timestamp: new Date().toISOString(),
      ...(options?.durationMs ? { durationMs: options.durationMs } : {}),
    },
  };
};

export const createErrorResponse = (
  code: string,
  message: string,
  requestId?: string
): ApiErrorResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(requestId ? { requestId } : {}),
    },
  };
};
