import { Hono } from 'hono';
import type { AppVariables } from '../middleware/index.js';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { usersTable, userProfilesTable } from '../db/schema.js';
import { authMiddleware } from '../middleware/index.js';
import { validateRequest, updateProfileSchema } from '../utils/validation.js';
import { createSuccessResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

export const usersRouter = new Hono<{ Variables: AppVariables }>();

// GET /api/v1/users/me -> Fetch current authenticated user's profile
usersRouter.get('/me', authMiddleware(), async (c) => {
  const loggedInUser = c.get('user')!;

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      username: usersTable.username,
      role: usersTable.role,
      displayName: userProfilesTable.displayName,
      bio: userProfilesTable.bio,
      avatarUrl: userProfilesTable.avatarUrl,
      websiteUrl: userProfilesTable.websiteUrl,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .leftJoin(userProfilesTable, eq(userProfilesTable.userId, usersTable.id))
    .where(eq(usersTable.id, loggedInUser.id))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User record not found');
  }

  return c.json(createSuccessResponse(user), 200);
});

// PUT /api/v1/users/me -> Update authenticated user's profile details
usersRouter.put('/me', authMiddleware(), async (c) => {
  const loggedInUser = c.get('user')!;
  const body = await c.req.json();
  const input = validateRequest(updateProfileSchema, body);

  await db
    .update(userProfilesTable)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(userProfilesTable.userId, loggedInUser.id));

  const [updatedUser] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      username: usersTable.username,
      role: usersTable.role,
      displayName: userProfilesTable.displayName,
      bio: userProfilesTable.bio,
      avatarUrl: userProfilesTable.avatarUrl,
      websiteUrl: userProfilesTable.websiteUrl,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .leftJoin(userProfilesTable, eq(userProfilesTable.userId, usersTable.id))
    .where(eq(usersTable.id, loggedInUser.id))
    .limit(1);

  return c.json(createSuccessResponse(updatedUser), 200);
});

// GET /api/v1/users/:username -> Fetch public profile of a user by username
usersRouter.get('/:username', async (c) => {
  const username = c.req.param('username');

  const [profile] = await db
    .select({
      username: usersTable.username,
      displayName: userProfilesTable.displayName,
      bio: userProfilesTable.bio,
      avatarUrl: userProfilesTable.avatarUrl,
      websiteUrl: userProfilesTable.websiteUrl,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .leftJoin(userProfilesTable, eq(userProfilesTable.userId, usersTable.id))
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!profile) {
    throw new NotFoundError(`User with username '${username}' not found`);
  }

  return c.json(createSuccessResponse(profile), 200);
});

// DELETE /api/v1/users/me -> Delete current user account (cascades profiles & items)
usersRouter.delete('/me', authMiddleware(), async (c) => {
  const loggedInUser = c.get('user')!;

  await db.delete(usersTable).where(eq(usersTable.id, loggedInUser.id));

  return c.json(createSuccessResponse({ message: 'Account deleted successfully' }), 200);
});
