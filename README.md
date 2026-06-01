# Enterprise Platform Backend 🚀

Production-grade distributed backend platform engineered with strict TypeScript, pnpm workspaces, and Turborepo.

This project demonstrates enterprise backend engineering patterns including:

* Distributed service architecture
* Contract-first API design
* Runtime lifecycle orchestration
* Typed infrastructure boundaries
* Secure authentication flows
* Structured observability
* Event-driven messaging
* Production-ready PostgreSQL + Redis integration

> ⚠️ 
> The codebase follows strict architectural and engineering standards intended for real-world backend systems.

---

# ✨ Core Architecture

The platform uses a **microservice-oriented monorepo architecture** with strict package boundaries.

## Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Language       | TypeScript                       |
| Runtime        | Node.js                          |
| Monorepo       | Turborepo + pnpm Workspaces      |
| HTTP Framework | Hono                             |
| API Contracts  | Zod + OpenAPI                    |
| Database       | PostgreSQL                       |
| ORM            | Drizzle ORM                      |
| Cache          | Redis                            |
| Messaging      | RabbitMQ                         |
| Logging        | Winston                          |
| Observability  | OpenTelemetry-ready abstractions |

---

# 📦 Repository Structure

```txt
apps/
packages/
infra/
```

---

# 🧩 Applications

## `auth-service`

Authentication and session management service.

Responsibilities:

* User registration
* Login/logout
* JWT issuance
* Refresh token rotation
* Session management
* Health endpoints
* Swagger/OpenAPI documentation

Status: ✅ In Active Development

---

## `api-gateway`

Edge routing and centralized request handling.

Planned responsibilities:

* Reverse proxy
* JWT validation
* RBAC enforcement
* Rate limiting
* OpenAPI aggregation

Status: 🚧 Planned

---

## `blog-service`

Blog content domain.

Planned responsibilities:

* Blog CRUD
* Draft/publish workflows
* Tag/category management
* Cursor pagination
* Search

Status: 🚧 Planned

---

## `interaction-service`

User interaction domain.

Planned responsibilities:

* Comments
* Likes
* Reactions
* Bookmarks

Status: 🚧 Planned

---

## `notification-service`

Asynchronous notification processing.

Planned responsibilities:

* Email delivery
* Event consumers
* Retry queues
* Dead-letter handling

Status: 🚧 Planned

---

# 🧱 Platform Packages

All shared modules live under the `@platform/*` namespace.

---

## `@platform/runtime`

Lifecycle orchestration engine.

Features:

* Sequential startup
* Graceful shutdown
* Failure rollback
* Signal handling
* Resource state management

---

## `@platform/http`

Reusable HTTP runtime utilities.

Features:

* Error middleware
* Request timing
* Request IDs
* Standard API responses
* Health checks

---

## `@platform/auth`

Authentication and cryptographic utilities.

Features:

* JWT issuance/verification
* Bcrypt hashing
* Opaque refresh tokens
* Typed token claims

---

## `@platform/database`

Database abstraction layer.

Features:

* Drizzle ORM integration
* Runtime-managed PostgreSQL client
* Domain-based schemas
* Migrations

---

## `@platform/redis`

Redis infrastructure package.

Features:

* Runtime-managed Redis client
* Cache utilities
* Lock primitives
* Pub/Sub foundation

---

## `@platform/messaging`

RabbitMQ abstraction layer.

Features:

* Publisher/consumer APIs
* Event serialization
* Queue topology assertion
* Graceful consumer shutdown

---

## `@platform/contracts`

Pure TypeScript contract boundary.

Features:

* API request/response types
* Domain primitives
* Event payload contracts
* Shared metadata

---

## `@platform/validation`

Strict request validation layer.

Features:

* Zod schemas
* Typed validation helpers
* Request parsing
* Sanitized validation errors

---

## `@platform/logger`

Structured JSON logging system.

Features:

* AsyncLocalStorage request context
* Correlation IDs
* Redaction
* Error serialization

---

## `@platform/configuration`

Fail-fast environment configuration.

Features:

* Zod-validated environment variables
* Immutable runtime config
* Nested dot-notation parsing
* Secret redaction

---

## `@platform/errors`

Typed domain error hierarchy.

Features:

* Authentication errors
* Authorization errors
* Validation errors
* Infrastructure errors

---

## `@platform/observability`

Telemetry and tracing abstractions.

Features:

* Trace propagation
* Context extraction/injection
* OpenTelemetry-ready runtime

---

## `@platform/shared-kernel`

Zero-dependency utility package.

Features:

* Slug generation
* Cursor pagination
* Date helpers

---

# 🚀 Getting Started

## Prerequisites

* Node.js 20+
* pnpm
* PostgreSQL
* Redis

---

# 📥 Installation

```bash
git clone <repository-url>

cd blog-server

pnpm install
```

---

# ⚙️ Environment Configuration

Create a `.env` file in the project root.

Example:

```env
# Database
database.url=postgresql://user:password@localhost:5432/blog_server

# Redis
redis.url=redis://localhost:6379

# JWT
jwt.secret=super_secret_key

# Services
services.auth=http://localhost:3001
```

---

# 🗄️ Database Setup

Generate migrations:

```bash
pnpm --filter @platform/database db:generate
```

Run migrations:

```bash
pnpm --filter @platform/database db:migrate
```

---

# ▶️ Development

Run all services:

```bash
pnpm turbo run dev
```

Build workspace:

```bash
pnpm turbo run build
```

Typecheck:

```bash
pnpm turbo run typecheck
```

---

# 📚 API Documentation

Swagger UI:

```txt
http://localhost:3001/docs
```

OpenAPI Spec:

```txt
http://localhost:3001/openapi.json
```

---

# 🔒 Security Model

This platform follows a production-oriented authentication model.

## Access Tokens

* Stateless JWTs
* Explicit HS256 algorithm
* Short-lived expiration
* Typed claims

## Refresh Tokens

* Opaque random tokens
* Stored hashed in PostgreSQL
* Revocable
* Rotatable
* Session-safe

## Passwords

* Bcrypt hashing
* 12 rounds
* No plaintext storage

---

# 🧠 Engineering Principles

---

## Strict Type Safety

Enabled globally:

```json
"strict": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true
```

The `any` type is forbidden.

---

## Contract-First Development

All APIs are defined through shared contracts and validation schemas before implementation.

---

## Infrastructure Isolation

Apps never directly touch infrastructure libraries.

Example:

* Services never import `amqplib`
* Services never import raw `postgres`
* Services never import raw `ioredis`

Everything passes through `@platform/*` boundaries.

---

## Runtime Lifecycle Management

Infrastructure resources are treated as managed runtime dependencies.

The lifecycle manager handles:

* startup ordering
* shutdown sequencing
* rollback on failure
* signal handling

---

# 🧪 Current Platform Status

| Component                | Status         |
| ------------------------ | -------------- |
| Runtime System           | ✅ Complete     |
| Database Layer           | ✅ Complete     |
| HTTP Runtime             | ✅ Complete     |
| Auth Package             | ✅ Complete     |
| Validation Layer         | ✅ Complete     |
| Messaging Layer          | ✅ Complete     |
| Redis Runtime            | ✅ Complete     |
| Observability Foundation | ✅ Complete     |
| Auth Service             | 🚧 In Progress |
| API Gateway              | 🚧 Planned     |
| Blog Service             | 🚧 Planned     |
| Interaction Service      | 🚧 Planned     |
| Notification Service     | 🚧 Planned     |

---

# ⚠️ Known Technical Debt

Current known issues being addressed:

* Refresh token lookup optimization
* Rate limiting implementation
* Migration automation
* Full OpenTelemetry integration
* Automated testing coverage

---

# 🛠️ Planned Features

## Phase 2

* User service
* Blog service
* Interaction service
* Notification service

## Phase 3

* Redis rate limiting
* RabbitMQ integration
* Token blacklisting

## Phase 4

* API Gateway
* RBAC middleware
* Request aggregation

## Phase 5

* Full observability stack
* Grafana dashboards
* Loki logging
* Tempo tracing

## Phase 6

* Docker production deployment
* GitHub Actions CI/CD
* Multi-stage builds

## Phase 7

* Unit testing
* Integration testing
* E2E testing
* Load testing

---

# 🤝 Contribution Rules

This repository enforces strict engineering conventions.

---

## Naming Conventions

| Type             | Convention |
| ---------------- | ---------- |
| Files            | kebab-case |
| Variables        | camelCase  |
| Types/Classes    | PascalCase |
| Database Columns | snake_case |

---

## Import Rules

All local imports must include `.js` extensions.

Example:

```ts
import { config } from './config.js';
```

---

## Commit Convention

Conventional commits are required.

Examples:

```txt
feat(auth): add refresh token rotation
fix(database): resolve transaction leak
refactor(runtime): simplify shutdown orchestration
docs(readme): update setup instructions
```

---

# 📌 Important Notes

* No frontend exists in this repository.
* APIs are consumed via Swagger/OpenAPI.
* This platform is intentionally backend-focused.
* Architectural boundaries are strict and intentional.

---

# 📄 License

MIT License

---

# 👨‍💻 Engineer

Built and maintained by Gourab.

Focused on backend engineering, distributed systems, runtime architecture, and production-grade infrastructure design.
