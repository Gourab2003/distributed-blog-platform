# API & EVENT CONTRACT STANDARDS

## 1. Executive Summary
Contract-First engineering ensures strict synchronization between microservices. All HTTP REST request/response interfaces and RabbitMQ event message payloads are defined as pure TypeScript interfaces in `@platform/contracts` and validated via Zod schemas in `@platform/validation`.

---

## 2. HTTP REST Contract Standards (`@platform/contracts/api/v1/*`)

### Standard Success Response Format
All HTTP endpoints return responses structured via the `@platform/http` response formatter:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_c9a18f23",
    "timestamp": "2026-08-12T13:47:34.000Z",
    "pagination": {
      "nextCursor": "eyJpZCI6IjEyMyJ9",
      "hasMore": true
    }
  }
}
```

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Blog post with ID '123' does not exist.",
    "details": [],
    "requestId": "req_c9a18f23",
    "timestamp": "2026-08-12T13:47:34.000Z"
  }
}
```

---

## 3. Core REST Endpoints Inventory

### A. Authentication (`auth-service`)
- `POST /api/v1/auth/register`: Register new user account.
- `POST /api/v1/auth/login`: Authenticate email/password, return access token & refresh token.
- `POST /api/v1/auth/refresh`: Rotate refresh token & issue new JWT access token.
- `POST /api/v1/auth/logout`: Revoke active refresh token session.
- `GET /api/v1/auth/me`: Fetch authenticated user session info.

### B. Blog Posts (`blog-service`)
- `GET /api/v1/posts`: Fetch paginated list of published blog posts.
- `GET /api/v1/posts/:slug`: Fetch single blog post by unique slug.
- `POST /api/v1/posts`: Create blog post (Draft status).
- `PUT /api/v1/posts/:id`: Update blog post content or title.
- `POST /api/v1/posts/:id/publish`: Change status to Published & trigger `blog.post.published` event.

---

## 4. RabbitMQ Event Contracts (`@platform/contracts/events/v1/*`)

Events are published asynchronously via `@platform/messaging` over RabbitMQ exchanges.

### User Domain Events (`user.ts`)
| Event Name | Exchange | Routing Key | Payload Interfaces | Trigger Condition |
| :--- | :--- | :--- | :--- | :--- |
| `user.created` | `user.events` | `user.created` | `UserCreatedEventPayload` | User finishes registration |
| `user.updated` | `user.events` | `user.updated` | `UserUpdatedEventPayload` | User updates profile info |
| `user.deleted` | `user.events` | `user.deleted` | `UserDeletedEventPayload` | Account deletion |

### Blog Domain Events (`blog.ts`)
| Event Name | Exchange | Routing Key | Payload Interfaces | Trigger Condition |
| :--- | :--- | :--- | :--- | :--- |
| `blog.post.created` | `blog.events` | `blog.post.created` | `BlogPostCreatedEventPayload` | Post drafted |
| `blog.post.updated` | `blog.events` | `blog.post.updated` | `BlogPostUpdatedEventPayload` | Post updated |
| `blog.post.published` | `blog.events` | `blog.post.published` | `BlogPostPublishedEventPayload` | Post published to readers |
| `blog.post.deleted` | `blog.events` | `blog.post.deleted` | `BlogPostDeletedEventPayload` | Post deleted |
