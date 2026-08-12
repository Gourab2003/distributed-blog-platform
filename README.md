# Monolithic Blogging Platform API Server 🚀

A production-grade monolithic backend blogging API server engineered using TypeScript, Hono, Node.js, and Drizzle ORM. 

This repository has been simplified from a complex microservices architecture into a clean, high-performance monolith, reducing operational complexity while retaining strict type safety and structured design.

---

## ✨ Features & Architecture

*   **HTTP Framework**: Built with [Hono](https://hono.dev/) for ultra-fast, lightweight HTTP routing.
*   **Database & ORM**: Driven by [PostgreSQL](https://www.postgresql.org/) and mapped with [Drizzle ORM](https://orm.drizzle.team/), utilizing postgres-js client pooling.
*   **Unified Schema**: Enforces real referential integrity (foreign keys and indexes) directly in the database.
*   **SQL Joins**: Implements direct SQL joins for high-performance retrieval (e.g., retrieving blog posts and parent comments alongside user author profiles in a single query).
*   **Stateless Authentication**: Features secure user registration, credentials verification via `bcryptjs`, stateless JWT access token verification, and rotatable, db-stored opaque refresh tokens.
*   **Consolidated Input Validation**: Validates all incoming request payloads at the routing boundary using [Zod](https://zod.dev/) schemas.
*   **Robust Logging & Middleware**: Automatically tracks request latency, injects UUID correlation headers, catches and serializes database/auth exceptions, and writes structured JSON logs directly to standard output/error.

---

## 📦 Project Layout

```txt
src/
├── config.ts               # Zod-validated environment config variables loading
├── main.ts                 # Hono server entrypoint and bootstrap setup
├── db/                     # Database setup
│   ├── client.ts           # Postgres-js connection pool initialization
│   ├── schema.ts           # Single combined schema file for all SQL tables
│   └── migrate.ts          # Programmatic migration execution runner
├── routes/                 # Consolidated endpoint routers
│   ├── auth.ts             # Registration, login, logout, and token rotation
│   ├── users.ts            # Public profiles and private settings endpoints
│   ├── posts.ts            # Blog post CRUD (with direct author profile joins)
│   ├── comments.ts         # Hierarchical comments list and toggle likes
│   └── health.ts           # Server liveness and database readiness checks
├── middleware/             # Request lifecycle handlers
│   └── index.ts            # Logging, error formatting, and JWT authentication middleware
└── utils/                  # Helper utilities
    ├── auth.ts             # Bcrypt hashing and jsonwebtoken verification
    ├── response.ts         # Standard API success/error formatter helpers
    ├── validation.ts       # Zod schemas and validation parser
    ├── slug.ts             # SEO slug creator
    └── pagination.ts       # Base64 cursor-based pagination encoder/decoder
migrations/                 # Auto-generated Drizzle Kit SQL migrations
docker-compose.yml          # Local PostgreSQL docker environment configuration
tsconfig.json               # TypeScript compiler config
package.json                # Single root package manifest
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 20+
*   pnpm (or npm / yarn)
*   Docker (for running database locally)

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone <repository-url>
cd blog-server
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blog_server
JWT_SECRET=super_secret_jwt_access_secret_key_minimum_32_chars
JWT_ISSUER=blog-platform
JWT_AUDIENCE=blog-platform-users
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
```

### 3. Spin Up PostgreSQL
Launch the database container using Docker Compose:
```bash
docker compose up -d
```

### 4. Run Database Migrations
Execute the migrations to set up the database tables and schemas:
```bash
npm run db:migrate
```

### 5. Start Development Server
Launch the Hono server locally:
```bash
npm run dev
```
The server will start listening at `http://localhost:3000`.

---

## 🗃️ Development Scripts

*   `npm run dev`: Launch the server in watcher development mode.
*   `npm run build`: Compile TypeScript into the `dist/` production folder.
*   `npm run start`: Launch the compiled production server.
*   `npm run typecheck`: Perform static compiler typechecks.
*   `npm run db:generate`: Scan `src/db/schema.ts` and generate new migration files.
*   `npm run db:migrate`: Apply pending migration files to the database.

---

## 🔒 REST APIs Inventory

### A. Authentication (`/api/v1/auth`)
*   `POST /register`: Register new user account.
*   `POST /login`: Authenticate credentials, return access token & refresh token.
*   `POST /refresh`: Rotate refresh token and issue new access token.
*   `POST /logout`: Revoke active refresh token session.

### B. User Profiles (`/api/v1/users`)
*   `GET /me`: Fetch authenticated user profile & account details.
*   `PUT /me`: Update display name, bio, avatar, and website.
*   `DELETE /me`: Delete account.
*   `GET /:username`: Fetch public profile metadata by username.

### C. Blog Posts (`/api/v1/posts`)
*   `GET /`: Fetch paginated list of published posts (supports `limit` and `cursor`).
*   `GET /:slug`: Fetch single blog post by unique slug (includes author profile).
*   `POST /`: Create blog post (Draft status).
*   `PUT /:id`: Update blog post title or content.
*   `POST /:id/publish`: Change status to Published and trigger in-process notification.
*   `DELETE /:id`: Delete blog post.

### D. Comments & Likes (`/api/v1/posts/:postId`)
*   `GET /comments`: Fetch post comment list (includes user author profiles).
*   `POST /comments`: Add comment or reply.
*   `POST /like`: Toggle post like status.

### E. Health checks (`/health`)
*   `GET /live`: Hono process liveness check.
*   `GET /ready`: Database connectivity check.

---

## 📄 License
MIT
