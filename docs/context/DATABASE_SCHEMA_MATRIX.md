# DATABASE SCHEMA MATRIX & TABLE OWNERSHIP SPECIFICATIONS

## 1. Single PostgreSQL Instance Architecture
The platform operates on a single PostgreSQL database instance managed via **Drizzle ORM** in `@platform/database`.

- **Database Name**: `blog_server`
- **ORM**: Drizzle ORM (`drizzle-orm/pg-core`)
- **Schema Location**: `packages/database/src/schema/`
- **Migration Location**: `packages/database/migrations/`

---

## 2. Service Table Ownership Matrix

> [!IMPORTANT]
> **Strict Domain Partitioning Rule**: Each table in PostgreSQL is owned exclusively by ONE microservice. No service may read, write, or join tables owned by another service. Cross-service data fetching MUST occur via HTTP REST APIs or asynchronous RabbitMQ events.

| Microservice | Owned Schema Directory | Database Tables | Foreign Key Dependencies | Description |
| :--- | :--- | :--- | :--- | :--- |
| `auth-service` | `schema/auth` | `refresh_token` | References `users.id` (Soft FK / Managed) | Session management, opaque token hashes & revocation |
| `user-service` | `schema/users` | `users`, `user_profiles` | None | User accounts, credentials, roles, profiles & settings |
| `blog-service` | `schema/blogs` | `posts`, `categories`, `post_tags` | Stores `author_id` (UUID references `users.id`) | Blog posts, draft/published workflows, slugs |
| `interaction-service` | `schema/interactions` | `comments`, `likes`, `bookmarks` | Stores `user_id`, `post_id` | User social interactions, comments tree, post likes |
| `notification-service` | `schema/notifications` | `notifications`, `email_logs` | Stores `user_id` | User notifications, delivery status & retry logs |

---

## 3. Table Schema Definitions & Indexes

### A. `users` Table (`schema/users/users.table.ts`)
Owned by: **`user-service`** / **`auth-service`** (auth credential read)
```sql
CREATE TYPE user_role AS ENUM ('admin', 'author', 'user');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    email_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### B. `refresh_token` Table (`schema/auth/refresh-tokens.table.ts`)
Owned by: **`auth-service`**
```sql
CREATE TABLE refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX refresh_token_user_id_idx ON refresh_token(user_id);
CREATE INDEX refresh_token_is_revoked_idx ON refresh_token(is_revoked);
```

### C. `posts` Table (`schema/blogs/posts.table.ts`)
Owned by: **`blog-service`**
```sql
CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL, -- Logical reference to users.id
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status blog_post_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX posts_author_id_idx ON posts(author_id);
CREATE INDEX posts_slug_idx ON posts(slug);
```

---

## 4. Drizzle Migration Commands
```bash
# Generate Drizzle migration files
pnpm --filter @platform/database db:generate

# Execute pending database migrations
pnpm --filter @platform/database db:migrate
```
