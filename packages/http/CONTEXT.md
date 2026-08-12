# PACKAGE CONTEXT: HTTP (`@platform/http`)

## 1. Domain Responsibilities
The `@platform/http` package provides standardized Hono HTTP framework middleware, standard response builders, request correlation ID propagation, and global error handling.

Key Responsibilities:
- **Hono Application Utilities**: `createHttpApp` factory with pre-configured middleware.
- **Middleware**:
  - Request ID injection (`x-request-id`) & AsyncLocalStorage correlation context.
  - Performance timing middleware (`x-response-time`).
  - Global error handling middleware (catches `AppError` and formats standardized JSON error responses).
- **Response Formatters**: Helper functions (`successResponse`, `createdResponse`, `paginatedResponse`).
- **Health Check Endpoint Route**: Pre-built `/health` and `/ready` routes.

---

## 2. Standardized API Response Schema
```ts
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    pagination?: {
      nextCursor?: string;
      hasMore: boolean;
    };
  };
}
```
