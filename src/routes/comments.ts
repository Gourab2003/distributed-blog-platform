import { Hono } from 'hono';
import type { AppVariables } from '../middleware/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { commentsTable, likesTable, usersTable, userProfilesTable, postsTable } from '../db/schema.js';
import { authMiddleware } from '../middleware/index.js';
import { validateRequest, createCommentSchema } from '../utils/validation.js';
import { createSuccessResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

export const commentsRouter = new Hono<{ Variables: AppVariables }>();

// GET /api/v1/posts/:postId/comments -> Fetch list of comments for a post
commentsRouter.get('/:postId/comments', async (c) => {
  const postId = c.req.param('postId') || '';

  // Verify post exists
  const [post] = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!post) {
    throw new NotFoundError(`Blog post with ID '${postId}' not found`);
  }

  const comments = await db
    .select({
      id: commentsTable.id,
      content: commentsTable.content,
      parentCommentId: commentsTable.parentCommentId,
      createdAt: commentsTable.createdAt,
      user: {
        id: usersTable.id,
        username: usersTable.username,
        displayName: userProfilesTable.displayName,
        avatarUrl: userProfilesTable.avatarUrl,
      },
    })
    .from(commentsTable)
    .leftJoin(usersTable, eq(usersTable.id, commentsTable.userId))
    .leftJoin(userProfilesTable, eq(userProfilesTable.userId, commentsTable.userId))
    .where(eq(commentsTable.postId, postId))
    .orderBy(desc(commentsTable.createdAt));

  return c.json(createSuccessResponse(comments), 200);
});

// POST /api/v1/posts/:postId/comments -> Add a comment to a post
commentsRouter.post('/:postId/comments', authMiddleware(), async (c) => {
  const postId = c.req.param('postId') || '';
  const loggedInUser = c.get('user')!;
  const body = await c.req.json();
  const input = validateRequest(createCommentSchema, body);

  // Verify post exists
  const [post] = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!post) {
    throw new NotFoundError(`Blog post with ID '${postId}' not found`);
  }

  const [newComment] = await db
    .insert(commentsTable)
    .values({
      postId,
      userId: loggedInUser.id,
      content: input.content,
      parentCommentId: input.parentCommentId,
    })
    .returning();

  return c.json(createSuccessResponse(newComment), 201);
});

// POST /api/v1/posts/:postId/like -> Toggle like status on post
commentsRouter.post('/:postId/like', authMiddleware(), async (c) => {
  const postId = c.req.param('postId') || '';
  const loggedInUser = c.get('user')!;

  // Verify post exists
  const [post] = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!post) {
    throw new NotFoundError(`Blog post with ID '${postId}' not found`);
  }

  // Check if like exists
  const [existingLike] = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.postId, postId), eq(likesTable.userId, loggedInUser.id)))
    .limit(1);

  if (existingLike) {
    // Unlike
    await db
      .delete(likesTable)
      .where(and(eq(likesTable.postId, postId), eq(likesTable.userId, loggedInUser.id)));

    return c.json(createSuccessResponse({ liked: false }), 200);
  } else {
    // Like
    await db.insert(likesTable).values({
      postId,
      userId: loggedInUser.id,
    });

    return c.json(createSuccessResponse({ liked: true }), 200);
  }
});
