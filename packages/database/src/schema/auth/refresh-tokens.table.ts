import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { usersTable } from "../users/users.table.js";
import { timestamps } from "../shared/timestamps.js";


export const refreshTokensTable = pgTable(
    'refresh_token',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(()=> usersTable.id, {onDelete: 'cascade'}),
        tokenHash: text('token_hash').notNull(),
        expiresAt: timestamp('expires_at', { withTimezone:true, mode: 'date' }).notNull(),
        revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
        isRevoked: boolean('is_revoked').notNull().default(false),
        ...timestamps
    },
    (table) =>({
        userIdIdx: index('refresh_token_user_id_idx').on(table.userId),
        isRevokedIdx: index('refresh_token_is_revoked_idx').on(table.isRevoked),
    })
);

export type RefreshTokenRecord = typeof refreshTokensTable.$inferSelect;
export type NewRefreshTokenRecord = typeof refreshTokensTable.$inferInsert;