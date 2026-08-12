# SERVICE CONTEXT: API GATEWAY (`apps/api-gateway`)

## 1. Domain Responsibilities
The `api-gateway` acts as the edge reverse proxy and API entry point for external clients.

Key Responsibilities:
- **Request Routing**: Proxies REST traffic to downstream services (`auth-service`, `user-service`, `blog-service`, `interaction-service`).
- **Edge Authentication**: Validates stateless JWT access tokens via `@platform/auth` before forwarding requests to internal services.
- **Rate Limiting**: Protects downstream microservices using Redis-backed token bucket rate limiting via `@platform/redis`.
- **OpenAPI Consolidation**: Aggregates Swagger OpenAPI specs from downstream microservices into a unified endpoint.

---

## 2. Infrastructure & Package Dependencies
- `@platform/configuration`: Environment validation (`PORT`, `REDIS_URL`, service URLs).
- `@platform/http`: Hono server framework & error handling middleware.
- `@platform/auth`: JWT verification & token claim extraction.
- `@platform/redis`: Token bucket rate limiting counter storage.
- `@platform/logger`: Request correlation ID injection.
- `@platform/observability`: OpenTelemetry trace context propagation.

---

## 3. Database & Table Ownership Matrix
> [!NOTE]
> The `api-gateway` owns **NO database tables**. It is a stateless proxy service.

---

## 4. Routing Table & Upstream Services
| External Route | Target Service | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/*` | `auth-service:3001` | No | Login, register, token refresh |
| `/api/v1/users/*` | `user-service:3002` | Yes | Profile management |
| `/api/v1/posts/*` | `blog-service:3003` | Optional | Article retrieval and creation |
| `/api/v1/interactions/*` | `interaction-service:3004` | Yes | Comments and likes |
