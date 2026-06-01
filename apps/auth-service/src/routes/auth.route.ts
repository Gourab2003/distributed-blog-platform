import { OpenAPIHono } from '@hono/zod-openapi';
import { eq, or } from 'drizzle-orm';
import {
    hashPassword,
    verifyPassword,
    issueAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    verifyRefreshToken,
} from '@platform/auth';
import { validateRequest, registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from '@platform/validation';
import { usersTable, refreshTokensTable } from '@platform/database';
import { ValidationError, AuthenticationError } from '@platform/errors';
import { createSuccessResponse } from '@platform/http';
import { addSeconds } from '@platform/shared-kernel';
import { configuration } from '../config/index.js';
import {
    registerRoute,
    loginRoute,
    refreshRoute,
    logoutRoute,
} from './auth.openapi.js';
import type { AppVariables } from '../bootstrap/create-http-app.js';

// ── Internal Helpers ──────────────────────────────────────────────────────────

function parseTtlToSeconds(ttl: string): number {
    const unit = ttl.slice(-1);
    const value = parseInt(ttl.slice(0, -1), 10);
    if (unit === 'd') return value * 24 * 60 * 60;
    if (unit === 'h') return value * 60 * 60;
    if (unit === 'm') return value * 60;
    if (unit === 's') return value;
    throw new Error(`Unsupported TTL format: ${ttl}`);
}

// ── Route Registration ────────────────────────────────────────────────────────

export function registerAuthRoutes(
    app: OpenAPIHono<{ Variables: AppVariables }>,
): void {

    app.openapi(registerRoute, async (c) => {
        const body = await c.req.json();
        const input = validateRequest(registerSchema, body);
        const db = c.get('getDb')();

        const existingUser = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(
                or(
                    eq(usersTable.email, input.email),
                    eq(usersTable.username, input.userName),
                ),
            )
            .limit(1);

        if (existingUser.length > 0) {
            throw new ValidationError('Email or username is already in use');
        }

        const passwordHash = await hashPassword(input.password);

        const expiresAt = addSeconds(
            new Date(),
            parseTtlToSeconds(configuration.auth.refreshTokenTtl),
        );

        const rawRefreshToken = generateRefreshToken();
        const tokenHash = await hashRefreshToken(rawRefreshToken);

        const result = await db.transaction(async (tx) => {
            const [user] = await tx
                .insert(usersTable)
                .values({
                    email: input.email,
                    username: input.userName,
                    passwordHash,
                    role: 'user',
                    emailVerified: false,
                    isActive: true,
                })
                .returning({
                    id: usersTable.id,
                    email: usersTable.email,
                    role: usersTable.role,
                });
                
            if (!user) {
                throw new Error('Database failed to return the inserted user record');
            }

            await tx.insert(refreshTokensTable).values({
                userId: user.id,
                tokenHash,
                expiresAt,
                isRevoked: false,
            });

            return user;
        });

        const accessToken = issueAccessToken({
            userId: result.id,
            email: result.email,
            role: result.role,
            secret: configuration.secrets.jwt.secret,
            expiresIn: configuration.auth.accessTokenTtl,
            issuer: configuration.auth.jwtIssuer,
            audience: configuration.auth.jwtAudience,
        });

        return c.json(
            createSuccessResponse({
                accessToken,
                refreshToken: rawRefreshToken,
                expiresIn: configuration.auth.accessTokenTtl,
            }),
            201,
        );
    });

    app.openapi(loginRoute, async (c) => {
        const body = await c.req.json();
        const input = validateRequest(loginSchema, body);
        const db = c.get('getDb')();

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, input.email))
            .limit(1);

        if (!user) {
            throw new AuthenticationError('Invalid credentials');
        }

        if (!user.isActive) {
            throw new AuthenticationError('Account is deactivated');
        }

        const passwordMatch = await verifyPassword(input.password, user.passwordHash);

        if (!passwordMatch) {
            throw new AuthenticationError('Invalid credentials');
        }

        const rawRefreshToken = generateRefreshToken();
        const tokenHash = await hashRefreshToken(rawRefreshToken);
        const expiresAt = addSeconds(
            new Date(),
            parseTtlToSeconds(configuration.auth.refreshTokenTtl),
        );

        await db.insert(refreshTokensTable).values({
            userId: user.id,
            tokenHash,
            expiresAt,
            isRevoked: false,
        });

        const accessToken = issueAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            secret: configuration.secrets.jwt.secret,
            expiresIn: configuration.auth.accessTokenTtl,
            issuer: configuration.auth.jwtIssuer,
            audience: configuration.auth.jwtAudience,
        });

        return c.json(
            createSuccessResponse({
                accessToken,
                refreshToken: rawRefreshToken,
                expiresIn: configuration.auth.accessTokenTtl,
            }),
            200,
        );
    });

    app.openapi(refreshRoute, async (c) => {
        const body = await c.req.json();
        const input = validateRequest(refreshTokenSchema, body);
        const db = c.get('getDb')();

        const activeTokens = await db
            .select()
            .from(refreshTokensTable)
            .where(eq(refreshTokensTable.isRevoked, false));

        let matchedToken = null;

        for (const record of activeTokens) {
            const matches = await verifyRefreshToken(
                input.refreshToken,
                record.tokenHash,
            );
            if (matches) {
                matchedToken = record;
                break;
            }
        }

        if (!matchedToken) {
            throw new AuthenticationError('Invalid refresh token');
        }

        if (matchedToken.expiresAt < new Date()) {
            throw new AuthenticationError('Refresh token has expired');
        }

        const rawRefreshToken = generateRefreshToken();
        const tokenHash = await hashRefreshToken(rawRefreshToken);
        const expiresAt = addSeconds(
            new Date(),
            parseTtlToSeconds(configuration.auth.refreshTokenTtl),
        );

        await db.transaction(async (tx) => {
            await tx
                .update(refreshTokensTable)
                .set({ isRevoked: true, revokedAt: new Date() })
                .where(eq(refreshTokensTable.id, matchedToken.id));

            await tx.insert(refreshTokensTable).values({
                userId: matchedToken.userId,
                tokenHash,
                expiresAt,
                isRevoked: false,
            });
        });

        const [user] = await db
            .select({ email: usersTable.email, role: usersTable.role })
            .from(usersTable)
            .where(eq(usersTable.id, matchedToken.userId))
            .limit(1);

        if (!user) {
            throw new AuthenticationError('User not found');
        }

        const accessToken = issueAccessToken({
            userId: matchedToken.userId,
            email: user.email,
            role: user.role,
            secret: configuration.secrets.jwt.secret,
            expiresIn: configuration.auth.accessTokenTtl,
            issuer: configuration.auth.jwtIssuer,
            audience: configuration.auth.jwtAudience,
        });

        return c.json(
            createSuccessResponse({
                accessToken,
                refreshToken: rawRefreshToken,
                expiresIn: configuration.auth.accessTokenTtl,
            }),
            200,
        );
    });

    app.openapi(logoutRoute, async (c) => {
        const body = await c.req.json();
        const input = validateRequest(logoutSchema, body);
        const db = c.get('getDb')();

        const activeTokens = await db
            .select()
            .from(refreshTokensTable)
            .where(eq(refreshTokensTable.isRevoked, false));

        let matchedToken = null;

        for (const record of activeTokens) {
            const matches = await verifyRefreshToken(
                input.refreshToken,
                record.tokenHash,
            );
            if (matches) {
                matchedToken = record;
                break;
            }
        }

        if (matchedToken) {
            await db
                .update(refreshTokensTable)
                .set({ isRevoked: true, revokedAt: new Date() })
                .where(eq(refreshTokensTable.id, matchedToken.id));
        }

        return c.json(
            createSuccessResponse({ message: 'Logged out successfully' }),
            200,
        );
    });
}