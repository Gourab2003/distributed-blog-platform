# SERVICE CONTEXT: AUTH SERVICE (`apps/auth-service`)

## 1. Domain Responsibilities
The `auth-service` manages identity verification, authentication credentials, active user sessions, and cryptographic token issuance.

Key Responsibilities:
- **User Registration & Login**: Validates passwords via bcrypt and checks account status.
- **JWT Issuance**: Issues short-lived RS256/HS256 signed access tokens with custom claims.
- **Refresh Token Rotation**: Manages opaque refresh tokens stored hashed in PostgreSQL (`refresh_token` table). Implements automatic session revocation on token reuse.
- **Session Revocation**: Provides logout and global session invalidation endpoints.
- **OpenAPI Documentation**: Exposes OpenAPI specs at `/openapi.json` and Swagger UI at `/docs`.

---

## 2. Infrastructure & Package Dependencies
- `@platform/database`: Drizzle ORM client, `usersTable` and `refreshTokensTable`.
- `@platform/redis`: Active session caching and token revocation blacklists.
- `@platform/auth`: JWT issuance & verification, bcrypt hashing algorithms.
- `@platform/contracts`: Request/response types (`RegisterRequest`, `LoginRequest`, `AuthResponse`).
- `@platform/validation`: Zod request schemas.
- `@platform/runtime`: Managed startup (`dbRuntime`, `redisRuntime`, `httpRuntime`) & graceful shutdown.

---

## 3. Database & Table Ownership Matrix
- **Owned Tables**: `refresh_token` (`packages/database/src/schema/auth/refresh-tokens.table.ts`)
- **Shared Access Tables**: `users` (`packages/database/src/schema/users/users.table.ts`) — Reads user credentials for auth validation.

```sql
-- refresh_token table structure
CREATE TABLE refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

---

## 4. REST API Endpoint Specifications
- `POST /api/v1/auth/register`: Validate input, hash password, insert user record.
- `POST /api/v1/auth/login`: Verify password hash, generate JWT access token + refresh token, record refresh token hash.
- `POST /api/v1/auth/refresh`: Validate refresh token, revoke old token, issue new token pair.
- `POST /api/v1/auth/logout`: Revoke active refresh token.
- `GET /api/v1/auth/health`: Return service lifecycle health status.
