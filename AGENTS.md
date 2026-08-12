# AI AGENT DIRECTIVES & CONTEXT ENGINEERING RULES

## 🛑 MANDATORY STEP BEFORE ANY CODE MODIFICATION
You MUST read and consult the relevant `CONTEXT.md` file(s) before viewing or modifying source files in any microservice (`apps/*`), shared package (`packages/*`), or infrastructure configuration (`infra/*`).

### Context Hierarchy & Mapping
1. **System Architecture**: Read [ARCHITECTURE.md](file:///home/gourab/blog-server/docs/context/ARCHITECTURE.md) for global monorepo structure, Hono framework patterns, and Turborepo setup.
2. **Database & Schema Rules**: Read [DATABASE_SCHEMA_MATRIX.md](file:///home/gourab/blog-server/docs/context/DATABASE_SCHEMA_MATRIX.md) for strict table ownership rules and Drizzle ORM layout. **NO CROSS-SERVICE TABLE JOINS OR DIRECT MULTI-DOMAIN DATABASE MUTATIONS ARE ALLOWED.**
3. **API & Event Contracts**: Read [CONTRACTS_AND_EVENTS.md](file:///home/gourab/blog-server/docs/context/CONTRACTS_AND_EVENTS.md) for Zod/OpenAPI REST endpoints and RabbitMQ AMQP message contracts.
4. **Observability & Infrastructure**: Read [OBSERVABILITY_AND_INFRA.md](file:///home/gourab/blog-server/docs/context/OBSERVABILITY_AND_INFRA.md) for Winston/Loki logging, OpenTelemetry tracing, Prometheus metrics, and Nginx proxy setup.
5. **App Services**: Read `apps/<app-name>/CONTEXT.md` before altering microservices (`api-gateway`, `auth-service`, `blog-service`, `interaction-service`, `notification-service`, `user-service`).
6. **Platform Packages**: Read `packages/<package-name>/CONTEXT.md` before altering shared utilities under `@platform/*`.

---

## 🔄 AUTOMATIC CONTEXT MAINTENANCE RULE
Whenever you perform any of the following actions, you MUST automatically update the corresponding `CONTEXT.md` file(s) in the same task turn:
- **Architectural Changes**: Update `docs/context/ARCHITECTURE.md` or package `CONTEXT.md` when lifecycle hooks, dependencies, or infrastructure interfaces change.
- **Database Schema Updates**: Update `docs/context/DATABASE_SCHEMA_MATRIX.md` and the appropriate app/package `CONTEXT.md` whenever Drizzle ORM tables, columns, indexes, or migrations are created or altered.
- **API or Event Contract Modifications**: Update `docs/context/CONTRACTS_AND_EVENTS.md` and app `CONTEXT.md` whenever REST request/response schemas or RabbitMQ event payloads are modified.

---

## 📐 CODEBASE CONVENTIONS & STRICT ENGINE RULES
- **Language**: TypeScript with strict mode enabled (`"strict": true`, `"noUncheckedIndexedAccess": true`). **No `any` allowed.**
- **Imports**: All relative TypeScript imports must include `.js` file extensions (e.g. `import { config } from './config.js'`).
- **Namespace**: All shared packages live under `@platform/*`.
- **Isolation**: Applications MUST NEVER import raw driver dependencies (`amqplib`, `postgres`, `ioredis`, `winston`). All infrastructure operations must route through `@platform/*` packages.
- **Lifecycle**: Services must orchestrate startup/shutdown via `@platform/runtime` lifecycle manager.
