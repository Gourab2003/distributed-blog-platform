# SERVICE CONTEXT: BLOG SERVICE (`apps/blog-service`)

## 1. Domain Responsibilities
The `blog-service` manages the publishing lifecycle of blog content, categories, and tags.

Key Responsibilities:
- **Article Lifecycle**: Creation, editing, drafting, publishing, archiving, and deletion of articles.
- **Slug Generation**: Unique SEO slug generation using `@platform/shared-kernel`.
- **Cursor-Based Pagination**: Efficient list fetching using opaque cursors via `@platform/shared-kernel`.
- **Event Publishing**: Emits `blog.post.created`, `blog.post.updated`, and `blog.post.published` events to RabbitMQ via `@platform/messaging`.

---

## 2. Infrastructure & Package Dependencies
- `@platform/database`: `posts` and `tags` tables in PostgreSQL.
- `@platform/messaging`: RabbitMQ publisher for `blog.events` exchange.
- `@platform/redis`: Article caching layer for high-throughput reads.
- `@platform/contracts`: Blog payload contracts (`@platform/contracts/api/v1/blog.ts` & `@platform/contracts/events/v1/blog.ts`).
- `@platform/shared-kernel`: `generateSlug`, `paginateCursor`.

---

## 3. Database & Table Ownership Matrix
- **Owned Tables**: `posts`, `categories`, `post_tags` (`packages/database/src/schema/blogs/`)
- **Foreign References**: Stores `author_id` (Logical UUID reference to `users.id`). Direct table joins to `users` table are forbidden.

```sql
CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
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

## 4. REST API Endpoint Specifications
- `GET /api/v1/posts`: Get paginated list of published posts (supports `limit` and `cursor`).
- `GET /api/v1/posts/:slug`: Get post details by slug.
- `POST /api/v1/posts`: Create post (Draft).
- `PUT /api/v1/posts/:id`: Update post title or content.
- `POST /api/v1/posts/:id/publish`: Publish post and trigger RabbitMQ event `blog.post.published`.
- `DELETE /api/v1/posts/:id`: Soft delete or archive post.
