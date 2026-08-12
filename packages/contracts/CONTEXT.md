# PACKAGE CONTEXT: CONTRACTS (`@platform/contracts`)

## 1. Domain Responsibilities
The `@platform/contracts` package acts as the single source of truth for pure TypeScript types and interfaces shared across the workspace.

Key Responsibilities:
- **API Request/Response Interfaces**: Definitions for REST controllers in `src/api/v1/*`.
- **Event Payload Contracts**: Data schemas published over RabbitMQ in `src/events/v1/*`.
- **Domain Primitives**: Common entity IDs, ISO date strings, roles, and status enums in `src/domain/*`.

---

## 2. Directory Structure
```
packages/contracts/src/
├── api/
│   └── v1/
│       ├── auth.ts       # RegisterRequest, LoginRequest, AuthResponse
│       ├── blog.ts       # CreatePostRequest, PostResponse, PostListQuery
│       ├── user.ts       # UpdateProfileRequest, UserResponse
│       └── common.ts     # ApiResponse, PaginatedResponse, ApiError
├── domain/
│   └── index.ts          # EntityId, ISODateString, UserRole, BlogPostStatus
└── events/
    └── v1/
        ├── blog.ts       # BlogPostCreatedEventPayload, BlogPostPublishedEventPayload
        └── user.ts       # UserCreatedEventPayload, UserUpdatedEventPayload
```

---

## 3. Guiding Rules
- **Zero Third-Party Dependencies**: Must remain a pure TypeScript contract package.
- **Immutability**: All fields in event payload contracts MUST be declared `readonly`.
