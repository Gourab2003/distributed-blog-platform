import { pgTable, uuid, varchar, text, boolean, pgEnum, timestamp, unique, index, integer } from 'drizzle-orm/pg-core';

// ── Shared Helpers ───────────────────────────────────────────────────────────

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
} as const;

// ── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'author', 'user']);
export const blogPostStatusEnum = pgEnum('blog_post_status', ['draft', 'published', 'archived']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed']);

// ── Tables ───────────────────────────────────────────────────────────────────

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  emailVerified: boolean('email_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export const userProfilesTable = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  websiteUrl: varchar('website_url', { length: 255 }),
  ...timestamps,
});

export const refreshTokensTable = pgTable('refresh_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
  isRevoked: boolean('is_revoked').notNull().default(false),
  ...timestamps,
}, (table: any) => ({
  userIdIdx: index('refresh_token_user_id_idx').on(table.userId),
  isRevokedIdx: index('refresh_token_is_revoked_idx').on(table.isRevoked),
}));

export const postsTable = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  status: blogPostStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
  ...timestamps,
}, (table: any) => ({
  authorIdIdx: index('posts_author_id_idx').on(table.authorId),
  slugIdx: index('posts_slug_idx').on(table.slug),
}));

export const commentsTable = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => postsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id'), // Self-reference defined logically or explicitly
  content: text('content').notNull(),
  ...timestamps,
});

export const likesTable = pgTable('likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => postsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
}, (table: any) => ({
  likesPostIdUserIdUnique: unique('likes_post_id_user_id_unique').on(table.postId, table.userId),
}));

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  payload: text('payload').notNull(), // JSON serialized string
  status: notificationStatusEnum('status').notNull().default('pending'),
  retryCount: integer('retry_count').notNull().default(0),
  ...timestamps,
});

// Types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type UserProfile = typeof userProfilesTable.$inferSelect;
export type NewUserProfile = typeof userProfilesTable.$inferInsert;

export type RefreshToken = typeof refreshTokensTable.$inferSelect;
export type NewRefreshToken = typeof refreshTokensTable.$inferInsert;

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;

export type Comment = typeof commentsTable.$inferSelect;
export type NewComment = typeof commentsTable.$inferInsert;

export type Like = typeof likesTable.$inferSelect;
export type NewLike = typeof likesTable.$inferInsert;

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
