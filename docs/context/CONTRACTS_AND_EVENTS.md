# API & EVENT CONTRACT STANDARDS

## 1. Executive Summary
Request inputs are validated at the routing boundary using Zod schemas located in `src/utils/validation.ts`. Standard success and error responses are formatted using helper utilities in `src/utils/response.ts` to ensure consistent payloads. Asynchronous event brokers (like RabbitMQ) have been eliminated; all side effects (such as notification logs) are processed in-process within their respective route handlers.

---

## 2. API Contract Formatting Standard

### Success Response Format
All successful REST endpoints wrap their data payload like so:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_84a1d2f9",
    "timestamp": "2026-08-12T13:47:34.000Z",
    "durationMs": 15
  }
}
```

### Error Response Format
All errors (including validation, auth, and infrastructure failures) return a standard error body:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Blog post with slug 'hello-world' does not exist.",
    "requestId": "req_84a1d2f9"
  }
}
```

---

## 3. Core REST Endpoints Inventory

All routes are mounted relative to the Hono instance in `src/main.ts`.

### A. Authentication (`/api/v1/auth`)
- `POST /register`: Register new user account.
- `POST /login`: Authenticate credentials, return access token & refresh token.
- `POST /refresh`: Rotate refresh token and issue new access token.
- `POST /logout`: Revoke active refresh token session.

### B. User Profiles (`/api/v1/users`)
- `GET /me`: Fetch authenticated user profile & account details.
- `PUT /me`: Update display name, bio, avatar, and website.
- `DELETE /me`: Delete account.
- `GET /:username`: Fetch public profile metadata by username.

### C. Blog Posts (`/api/v1/posts`)
- `GET /`: Fetch paginated list of published blog posts (supports `limit` and `cursor`).
- `GET /:slug`: Fetch single blog post by unique slug (includes author profile details).
- `POST /`: Create blog post (Draft status).
- `PUT /:id`: Update blog post title or content.
- `POST /:id/publish`: Change status to Published and trigger in-process notification.
- `DELETE /:id`: Delete blog post.

### D. Interactions (`/api/v1/posts/:postId`)
- `GET /comments`: Fetch comments list for a post (with comment author profiles).
- `POST /comments`: Add comment or reply.
- `POST /like`: Toggle post like status.

### E. Health Checks (`/health`)
- `GET /live`: Hono process liveness probe.
- `GET /ready`: Database connection connectivity readiness check.
