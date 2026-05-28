import { pgTable, uuid, varchar, text, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { timestamps } from '../shared/timestamps.js';

export const userRoleEnum = pgEnum('user_role', ['admin', 'author', 'user']);

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

export type UserRecord = typeof usersTable.$inferSelect;
export type NewUserRecord = typeof usersTable.$inferInsert;