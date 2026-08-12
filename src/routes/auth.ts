import { Hono } from 'hono';
import type { AppVariables } from '../middleware/index.js';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { usersTable, refreshTokensTable, userProfilesTable } from '../db/schema.js';
import { ValidationError, AuthenticationError } from '../utils/errors.js';
import { validateRequest, registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from '../utils/validation.js';
import { createSuccessResponse } from '../utils/response.js';
import { config } from '../config.js';
import {
  hashPassword,
  verifyPassword,
  issueAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from '../utils/auth.js';

export const authRouter = new Hono<{ Variables: AppVariables }>();

// Helper to convert time strings (like '7d', '15m') to seconds
function parseTtlToSeconds(ttl: string): number {
  const unit = ttl.slice(-1);
  const value = parseInt(ttl.slice(0, -1), 10);
  if (unit === 'd') return value * 24 * 60 * 60;
  if (unit === 'h') return value * 60 * 60;
  if (unit === 'm') return value * 60;
  if (unit === 's') return value;
  throw new Error(`Unsupported TTL format: ${ttl}`);
}

authRouter.post('/register', async (c) => {
  const body = await c.req.json();
  const input = validateRequest(registerSchema, body);

  const existingUser = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      or(
        eq(usersTable.email, input.email),
        eq(usersTable.username, input.userName),
      )
    )
    .limit(1);

  if (existingUser.length > 0) {
    throw new ValidationError('Email or username is already in use');
  }

  const passwordHash = await hashPassword(input.password);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = await hashRefreshToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + parseTtlToSeconds(config.jwt.refreshTokenTtl) * 1000);

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

    // Initialize user profile automatically
    await tx.insert(userProfilesTable).values({
      userId: user.id,
      displayName: input.userName,
    });

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
    secret: config.jwt.secret,
    expiresIn: config.jwt.accessTokenTtl,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });

  return c.json(
    createSuccessResponse({
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: config.jwt.accessTokenTtl,
    }),
    201
  );
});

authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const input = validateRequest(loginSchema, body);

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
  const expiresAt = new Date(Date.now() + parseTtlToSeconds(config.jwt.refreshTokenTtl) * 1000);

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
    secret: config.jwt.secret,
    expiresIn: config.jwt.accessTokenTtl,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });

  return c.json(
    createSuccessResponse({
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: config.jwt.accessTokenTtl,
    }),
    200
  );
});

authRouter.post('/refresh', async (c) => {
  const body = await c.req.json();
  const input = validateRequest(refreshTokenSchema, body);

  const activeTokens = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.isRevoked, false));

  let matchedToken = null;

  for (const record of activeTokens) {
    const matches = await verifyRefreshToken(input.refreshToken, record.tokenHash);
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
  const expiresAt = new Date(Date.now() + parseTtlToSeconds(config.jwt.refreshTokenTtl) * 1000);

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
    secret: config.jwt.secret,
    expiresIn: config.jwt.accessTokenTtl,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });

  return c.json(
    createSuccessResponse({
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: config.jwt.accessTokenTtl,
    }),
    200
  );
});

authRouter.post('/logout', async (c) => {
  const body = await c.req.json();
  const input = validateRequest(logoutSchema, body);

  const activeTokens = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.isRevoked, false));

  let matchedToken = null;

  for (const record of activeTokens) {
    const matches = await verifyRefreshToken(input.refreshToken, record.tokenHash);
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
    200
  );
});
