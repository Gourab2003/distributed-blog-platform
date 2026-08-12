# PACKAGE CONTEXT: DATABASE (`@platform/database`)

## 1. Domain Responsibilities
The `@platform/database` package provides the PostgreSQL ORM database layer built on top of **Drizzle ORM** and `postgres` driver.

Key Responsibilities:
- **Drizzle Schema Definitions**: Centralized schema directory in `src/schema/` grouped by domain (`auth/`, `users/`, `blogs/`, `interactions/`, `notifications/`).
- **Managed Client Runtime**: `createDatabaseRuntime` implementing `@platform/runtime` LifecycleResource interface for startup connection validation and graceful pool shutdown.
- **Transaction Utilities**: Safe transaction isolation wrappers with automatic rollback on error.
- **Migration Engine**: Drizzle Kit integration (`db:generate`, `db:migrate`).

---

## 2. Shared Runtime Lifecycle Interface
```ts
export function createDatabaseRuntime(options: { config: DatabaseConfig; logger: Logger }): LifecycleResource & {
  db: DrizzlePostgresDatabase;
}
```

---

## 3. Schema Organization & Rules
- Tables are defined using `pgTable()` and exported alongside `$inferSelect` and `$inferInsert` types.
- Foreign keys referencing tables owned by OTHER microservices MUST be treated logically (UUID columns without explicit DB-level FK constraints where microservice partitioning is enforced).
