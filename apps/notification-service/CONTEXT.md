# SERVICE CONTEXT: NOTIFICATION SERVICE (`apps/notification-service`)

## 1. Domain Responsibilities
The `notification-service` is an event-driven worker microservice that processes asynchronous alerts and transactional emails.

Key Responsibilities:
- **RabbitMQ Consumer**: Listens to events on `user.events`, `blog.events`, and `interaction.events` exchanges.
- **Transactional Email Delivery**: Sends emails for user welcome (`user.created`), post publication alerts (`blog.post.published`), and comment notifications.
- **Retry Queues & Dead-Letter Handling**: Uses RabbitMQ dead-letter exchanges (`dlx.notifications`) and exponential backoff retry strategies for failed deliveries.

---

## 2. Infrastructure & Package Dependencies
- `@platform/messaging`: RabbitMQ consumer runtime, topology assertion (`assertQueue`, `bindQueue`).
- `@platform/database`: `notifications` and `email_logs` tables.
- `@platform/logger`: Structured delivery execution logging.
- `@platform/runtime`: Worker lifecycle manager.

---

## 3. Database & Table Ownership Matrix
- **Owned Tables**: `notifications`, `email_logs` (`packages/database/src/schema/notifications/`)

```sql
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status notification_status NOT NULL DEFAULT 'pending',
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

---

## 4. Consumer Subscriptions & Queue Topology
- **Queue**: `notification.user_registered` ──► Subscribed to `user.events` / `user.created`
- **Queue**: `notification.post_published` ──► Subscribed to `blog.events` / `blog.post.published`
- **Queue**: `notification.comment_added` ──► Subscribed to `interaction.events` / `interaction.comment.created`
- **DLX Queue**: `notification.dead_letter` ──► Captures messages failing maximum retry attempts.
