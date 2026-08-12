# GLOBAL SYSTEM ARCHITECTURE & PLATFORM LAYOUT

## 1. Executive Summary
This enterprise backend platform is built using a **unified monolithic architecture** using the Hono framework and Node.js runtime. It enforces clean separation of concerns using logical directory partitioning, validated environment configuration, a unified PostgreSQL database managed by Drizzle ORM, and request correlation tracing.

---

## 2. Directory Structure & Layout

```
blog-server/
├── src/
│   ├── config.ts               # Environment configuration and Zod validation
│   ├── main.ts                 # Hono server entrypoint and bootstrap logic
│   ├── db/                     # Drizzle ORM PostgreSQL connection and schema
│   │   ├── client.ts           # Postgres-js connection pool initialization
│   │   ├── schema.ts           # Combined database tables (users, posts, comments, likes, notifications)
│   │   └── migrate.ts          # Programmatic migration execution script
│   ├── routes/                 # Consolidated REST API endpoints
│   │   ├── auth.ts             # User registration, login, logout, and token rotation
│   │   ├── users.ts            # Public/private user profile management
│   │   ├── posts.ts            # Blog post CRUD (with direct author profile SQL joins)
│   │   ├── comments.ts         # Post comment hierarchy and likes toggling
│   │   └── health.ts           # Server liveness and readiness probes
│   ├── middleware/             # Request lifecycle handlers
│   │   └── index.ts            # Timing tracking, correlation IDs, custom error serialization, and JWT auth
│   └── utils/                  # Utility helpers
│       ├── auth.ts             # Cryptographic helpers (bcrypt, jsonwebtoken verification)
│       ├── response.ts         # Unified success/error JSON formatters
│       ├── slug.ts             # SEO url slug generator
│       └── pagination.ts       # Cursor-based pagination encoders
├── migrations/                 # Drizzle kit auto-generated SQL migrations
├── tsconfig.json               # Simplified TS compiler options
├── drizzle.config.ts           # Single database migration kit configuration
└── package.json                # Single package dependency manifest
```

---

## 3. Core Architectural Principles & Boundaries

### A. Modular Structure
While the platform runs as a single monolithic process, codebase concerns are modularly partitioned by directories under `src/routes/` and `src/utils/` to ensure readability and maintainable code boundaries.

### B. Single Database Instance with Direct SQL Joins
All tables reside in a single PostgreSQL database. Unlike the previous microservices setup, direct SQL joins are fully supported and encouraged for high-performance reading (e.g., joining posts with author user profiles when rendering the main feed).

### C. Unified Contract Validation
HTTP REST API request validation is enforced directly at the routing layer using Zod schema structures located in `src/utils/validation.ts`.

### D. Simplified Operational Pipeline
By removing the API gateway proxy and RabbitMQ message broker, operational complexity is minimized:
- Network hops are reduced to zero for internal communications.
- Process initialization and lifecycle management are simplified to standard node execution without Turborepo workspace linking.
