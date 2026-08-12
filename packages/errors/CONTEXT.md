# PACKAGE CONTEXT: ERRORS (`@platform/errors`)

## 1. Domain Responsibilities
The `@platform/errors` package defines the unified custom exception hierarchy used across all services and platform packages.

Key Responsibilities:
- **Base Class**: `AppError` extending standard JavaScript `Error`, containing HTTP status code, domain error code, message, and details array.
- **Domain Specific Error Classes**:
  - `ValidationError`: HTTP 400 Bad Request
  - `UnauthorizedError`: HTTP 401 Unauthorized
  - `ForbiddenError`: HTTP 403 Forbidden
  - `NotFoundError`: HTTP 404 Not Found
  - `ConflictError`: HTTP 409 Conflict
  - `InternalServerError`: HTTP 500 Internal Server Error
  - `InfrastructureError`: Connection failures to Redis, PostgreSQL, RabbitMQ.

---

## 2. Standardized Error Formatter
Converts any thrown `AppError` or unknown `Error` into a normalized JSON payload for HTTP responses via `@platform/http`.
