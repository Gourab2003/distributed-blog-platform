# PACKAGE CONTEXT: AUTH (`@platform/auth`)

## 1. Domain Responsibilities
The `@platform/auth` package provides core authentication primitives, token cryptographic signed operations, password hashing, and token claims verification.

Key Responsibilities:
- **JWT Operations**: Signed JWT token creation (`signAccessToken`), verification (`verifyAccessToken`), claim extraction.
- **Password Hashing**: Bcrypt password hashing (`hashPassword`) with 12 rounds and timing-safe verification (`verifyPassword`).
- **Opaque Token Generation**: Crypto-random hexadecimal string generation (`generateRefreshToken`) for refresh token rotation.
- **Token Hash Primitive**: SHA-256 token hashing (`hashRefreshToken`) before storing tokens in PostgreSQL.

---

## 2. Exported Interfaces & Modules
- `signAccessToken(payload: JwtPayload, secret: string, options?: SignOptions): string`
- `verifyAccessToken<T>(token: string, secret: string): T`
- `hashPassword(plaintext: string): Promise<string>`
- `verifyPassword(plaintext: string, hash: string): Promise<boolean>`
- `generateOpaqueToken(byteLength?: number): string`
- `hashOpaqueToken(token: string): string`

---

## 3. Dependency Rules & Isolation
- **Allowed Dependencies**: `jsonwebtoken`, `bcrypt`, `crypto`.
- **Forbidden Dependencies**: MUST NOT import `@platform/database`, Hono HTTP server objects, or microservice configurations directly.
