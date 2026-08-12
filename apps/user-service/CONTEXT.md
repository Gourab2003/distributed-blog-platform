# SERVICE CONTEXT: USER SERVICE (`apps/user-service`)

## 1. Domain Responsibilities
The `user-service` manages user profiles, preferences, role assignments, and account settings.

Key Responsibilities:
- **User Profile Management**: Public profiles, avatars, bios, social links.
- **User Settings**: Notification preferences, privacy settings.
- **Role & Privilege Administration**: Managing `admin`, `author`, `user` roles.
- **Event Publishing**: Emits `user.updated` and `user.deleted` events to RabbitMQ.

---

## 2. Infrastructure & Package Dependencies
- `@platform/database`: `users` and `user_profiles` tables.
- `@platform/redis`: User profile caching layer.
- `@platform/messaging`: RabbitMQ publisher engine.
- `@platform/contracts`: User API & Event interfaces (`@platform/contracts/api/v1/user.ts`).
- `@platform/validation`: Zod schemas for user profile updates.

---

## 3. Database & Table Ownership Matrix
- **Owned Tables**: `users`, `user_profiles` (`packages/database/src/schema/users/`)

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    website_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

---

## 4. REST API Endpoint Specifications
- `GET /api/v1/users/me`: Fetch authenticated user profile and account details.
- `PUT /api/v1/users/me`: Update display name, bio, or avatar.
- `GET /api/v1/users/:username`: Fetch public profile details by username.
- `DELETE /api/v1/users/me`: Initiate user account deletion workflow.
