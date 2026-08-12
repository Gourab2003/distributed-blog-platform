# PACKAGE CONTEXT: SHARED KERNEL (`@platform/shared-kernel`)

## 1. Domain Responsibilities
The `@platform/shared-kernel` package contains zero-dependency utility functions and domain-agnostic algorithm helpers.

Key Responsibilities:
- **Slug Generator**: `generateSlug(title: string): string` converting arbitrary text into URL-safe kebab-case strings.
- **Cursor Pagination Math**: `encodeCursor` / `decodeCursor` helpers for opaque base64 cursor string manipulation.
- **Date & Time Utilities**: ISO date formatting and timestamp arithmetic.
