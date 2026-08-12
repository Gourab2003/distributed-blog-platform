# GLOBAL SYSTEM ARCHITECTURE & MONOREPO LAYOUT

## 1. Executive Summary
This enterprise backend platform is built using a **decoupled microservice architecture** within a Turborepo + PNPM workspace monorepo. It enforces strict separation of concerns, contract-first API design, runtime lifecycle management, and typed infrastructure boundaries.

---

## 2. Monorepo Structure & Workspace Topology

```
blog-server/
├── apps/                         # Independent microservice applications
│   ├── api-gateway/              # Edge reverse proxy, JWT validation, rate limiting
│   ├── auth-service/             # Auth, sessions, JWT & refresh token rotation
│   ├── blog-service/             # Article CRUD, draft/publish flows, slug management
│   ├── interaction-service/      # Comments, likes, reactions, bookmarks
│   ├── notification-service/     # RabbitMQ consumers, email, retries, dead-letter queues
│   └── user-service/             # User profiles, user settings, roles
├── packages/                     # Shared platform infrastructure libraries (@platform/*)
│   ├── auth/                     # JWT issuance & bcrypt hashing primitives
│   ├── configuration/            # Fail-fast Zod environment config validation
│   ├── contracts/                # Pure TypeScript API request/response & event contracts
│   ├── database/                 # Drizzle ORM PostgreSQL abstractions & migrations
│   ├── errors/                   # Unified AppError hierarchy & HTTP status mappings
│   ├── http/                     # Hono HTTP server utilities & middleware
│   ├── logger/                   # Winston + AsyncLocalStorage request context logging
│   ├── messaging/                # RabbitMQ AMQP publisher/consumer engine
│   ├── observability/            # OpenTelemetry tracing & metric collection
│   ├── redis/                    # ioredis client runtime & distributed locking
│   ├── runtime/                  # Application lifecycle engine & signal handlers
│   ├── shared-kernel/            # Utilities (slug generator, cursor pagination)
│   └── validation/               # Zod request parser & schema validation helpers
└── infra/                        # Observability & gateway container configurations
    ├── grafana/                  # Metrics dashboards
    ├── loki/                     # Log aggregation targets
    ├── nginx/                    # Edge reverse proxy configs
    ├── prometheus/               # Metric collection rules
    └── tempo/                    # Distributed trace collector
```

---

## 3. Core Architectural Principles & Boundaries

### A. Infrastructure Isolation Layer
Microservices in `apps/*` MUST NEVER directly import low-level infrastructure drivers (such as `pg`, `ioredis`, `amqplib`, or `winston`). All infrastructure access is strictly encapsulated behind `@platform/*` abstractions.

### B. Managed Runtime Lifecycle Engine
Each microservice is bootstrapped using `@platform/runtime` lifecycle orchestration.
- **Sequential Startup**: Database Connection -> Redis Connection -> Messaging Topology -> HTTP Server.
- **Graceful Shutdown**: SIGINT / SIGTERM signals trigger reverse-order termination with configurable timeouts and rollback on failure.

### C. Contract-First API & Event Schema Design
- REST API contracts are defined in `@platform/contracts/api/v1/*` using TypeScript types and validated with Zod schemas from `@platform/validation`.
- Event payloads are published to RabbitMQ exchanges following immutable interfaces in `@platform/contracts/events/v1/*`.

### D. Single Database Instance with Strict Domain Schemas
A single PostgreSQL instance is shared across services, but table access is partitioned strictly by domain ownership in `@platform/database/src/schema/*`. Cross-domain SQL joins are strictly forbidden.
