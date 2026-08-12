# DATABASE SCHEMA MATRIX & SPECIFICATIONS

## 1. Single PostgreSQL Instance Architecture
The platform operates on a single PostgreSQL database instance managed via **Drizzle ORM** from `src/db/client.ts`.

- **Database Name**: `blog_server`
- **ORM**: Drizzle ORM (`drizzle-orm/pg-core`)
- **Schema Location**: `src/db/schema.ts`
- **Migration Location**: `migrations/`

---

## 2. Table Specifications & Relations

All tables reside in the same PostgreSQL schema. Referential integrity is strictly enforced at the database level using foreign keys.

| Table Name | Description | Key Foreign Keys / Indexes |
| :--- | :--- | :--- |
| `users` | User accounts, credentials, role definitions, status | None |
| `user_profiles` | User profile meta details (bio, avatar, displayName) | `user_id` references `users.id` (Cascade) |
| `refresh_token` | Revocable session refresh hashes | `user_id` references `users.id` (Cascade), index on `user_id`, `is_revoked` |
| `posts` | Blog articles, publication status, slugs | `author_id` references `users.id` (Cascade), index on `author_id`, `slug` |
| `comments` | User comment hierarchy on posts | `post_id` references `posts.id` (Cascade), `user_id` references `users.id` (Cascade) |
| `likes` | Post likes toggle tracker | `post_id` references `posts.id` (Cascade), `user_id` references `users.id` (Cascade), unique(`post_id`, `user_id`) |
| `notifications` | In-app user notifications history logs | `user_id` references `users.id` (Cascade) |

---

## 3. Core Database Schema Definitions (SQL equivalent)

### A. `users` Table
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

### B. `posts` Table
```sql
CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status blog_post_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

---

## 4. Drizzle Migration Commands

```bash
# Generate Drizzle migration files after editing src/db/schema.ts
npm run db:generate

# Execute pending database migrations against database URL in .env
npm run db:migrate
```
