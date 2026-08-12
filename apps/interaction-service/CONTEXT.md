# SERVICE CONTEXT: INTERACTION SERVICE (`apps/interaction-service`)

## 1. Domain Responsibilities
The `interaction-service` handles user social engagement logic across posts.

Key Responsibilities:
- **Comments Management**: Nestable comment threads on blog posts.
- **Likes & Reactions**: Toggle likes/reactions on blog posts.
- **Bookmarks**: User article bookmarking and reading lists.
- **Event Publishing**: Emits `interaction.comment.created` and `interaction.like.added` events to RabbitMQ.

---

## 2. Infrastructure & Package Dependencies
- `@platform/database`: `comments`, `likes`, `bookmarks` tables.
- `@platform/redis`: Real-time like counter caching and deduplication sets.
- `@platform/messaging`: RabbitMQ publisher engine.
- `@platform/contracts`: Interaction domain contracts.
- `@platform/http`: Standard Hono controllers and error handlers.

---

## 3. Database & Table Ownership Matrix
- **Owned Tables**: `comments`, `likes`, `bookmarks` (`packages/database/src/schema/interactions/`)
- **Foreign References**: Stores `user_id` (Logical UUID) and `post_id` (Logical UUID). Cross-table joins across databases are forbidden.

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
```

---

## 4. REST API Endpoint Specifications
- `GET /api/v1/posts/:postId/comments`: Fetch hierarchical comment list for a post.
- `POST /api/v1/posts/:postId/comments`: Add comment or reply.
- `POST /api/v1/posts/:postId/like`: Toggle like status on post.
- `POST /api/v1/posts/:postId/bookmark`: Bookmark post.
