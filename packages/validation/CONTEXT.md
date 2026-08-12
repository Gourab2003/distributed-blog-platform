# PACKAGE CONTEXT: VALIDATION (`@platform/validation`)

## 1. Domain Responsibilities
The `@platform/validation` package provides request validation utilities and Zod schema parsing helpers.

Key Responsibilities:
- **Zod Parsers**: `parseBody`, `parseQuery`, `parseParams` helper functions that validate raw incoming data and throw typed `ValidationError` on failure.
- **Hono Middleware**: Integration middleware for Hono router (`zValidator` wrapper).
- **Sanitized Validation Messages**: Converts Zod issue arrays into clean field-by-field error detail objects for HTTP responses.
