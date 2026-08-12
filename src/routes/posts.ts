import { Hono } from 'hono';
import type { AppVariables } from '../middleware/index.js';
import { and, or, lt, eq, desc } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { db } from '../db/client.js';
import { postsTable, usersTable, userProfilesTable } from '../db/schema.js';
import { authMiddleware } from '../middleware/index.js';
import { validateRequest, createPostSchema, updatePostSchema, cursorPaginationSchema } from '../utils/validation.js';
import { createSuccessResponse } from '../utils/response.js';
import { createSlug } from '../utils/slug.js';
import { encodeCursor, decodeCursor } from '../utils/pagination.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

export const postsRouter = new Hono<{ Variables: AppVariables }>();

// GET /api/v1/posts -> Get paginated list of published posts
postsRouter.get('/', async (c) => {
  const query = c.req.query();
  const { cursor, limit } = validateRequest(cursorPaginationSchema, query);

  let decodedCursor: { id: string; createdAt: string } | null = null;
  if (cursor) {
    try {
      decodedCursor = decodeCursor(cursor);
    } catch {
      // Ignore invalid cursor format, fallback to start of list
    }
  }

  let whereClause = eq(postsTable.status, 'published');

  if (decodedCursor) {
    whereClause = and(
      whereClause,
      or(
        lt(postsTable.createdAt, new Date(decodedCursor.createdAt)),
        and(
          eq(postsTable.createdAt, new Date(decodedCursor.createdAt)),
          lt(postsTable.id, decodedCursor.id)
        )
      )
    ) as any;
  }

  const posts = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      slug: postsTable.slug,
      content: postsTable.content,
      status: postsTable.status,
      publishedAt: postsTable.publishedAt,
      createdAt: postsTable.createdAt,
      updatedAt: postsTable.updatedAt,
      author: {
        id: usersTable.id,
        username: usersTable.username,
        displayName: userProfilesTable.displayName,
        avatarUrl: userProfilesTable.avatarUrl,
      },
    })
    .from(postsTable)
    .leftJoin(usersTable, eq(usersTable.id, postsTable.authorId))
    .leftJoin(userProfilesTable, eq(userProfilesTable.userId, postsTable.authorId))
    .where(whereClause)
    .orderBy(desc(postsTable.createdAt), desc(postsTable.id))
    .limit(limit + 1);

  const hasMore = posts.length > limit;
  const slicedPosts = hasMore ? posts.slice(0, limit) : posts;

  let nextCursor: string | undefined = undefined;
  if (hasMore && slicedPosts.length > 0) {
    const lastPost = slicedPosts[slicedPosts.length - 1];
    if (lastPost) {
      nextCursor = encodeCursor(lastPost.id, lastPost.createdAt.toISOString());
    }
  }

  return c.json(
    createSuccessResponse(slicedPosts, {
      requestId: c.get('requestId'),
    }),
    200
  );
});

// GET /api/v1/posts/:slug -> Get post by unique slug
postsRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const [post] = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      slug: postsTable.slug,
      content: postsTable.content,
      status: postsTable.status,
      publishedAt: postsTable.publishedAt,
      createdAt: postsTable.createdAt,
      updatedAt: postsTable.updatedAt,
      author: {
        id: usersTable.id,
        username: usersTable.username,
        displayName: userProfilesTable.displayName,
        avatarUrl: userProfilesTable.avatarUrl,
      },
    })
    .from(postsTable)
    .leftJoin(usersTable, eq(usersTable.id, postsTable.authorId))
    .leftJoin(userProfilesTable, eq(userProfilesTable.userId, postsTable.authorId))
    .where(eq(postsTable.slug, slug))
    .limit(1);

  if (!post) {
    throw new NotFoundError(`Blog post with slug '${slug}' not found`);
  }

  return c.json(createSuccessResponse(post), 200);
});

// POST /api/v1/posts -> Create new post (Draft by default)
postsRouter.post('/', authMiddleware(['author', 'admin']), async (c) => {
  const loggedInUser = c.get('user')!;
  const body = await c.req.json();
  const input = validateRequest(createPostSchema, body);

  const baseSlug = createSlug(input.title);
  const slugSuffix = randomBytes(4).toString('hex');
  const slug = `${baseSlug}-${slugSuffix}`;

  const [newPost] = await db
    .insert(postsTable)
    .values({
      authorId: loggedInUser.id,
      title: input.title,
      slug,
      content: input.content,
      status: 'draft',
    })
    .returning();

  return c.json(createSuccessResponse(newPost), 201);
});

// PUT /api/v1/posts/:id -> Update post content or title (author/admin only)
postsRouter.put('/:id', authMiddleware(['author', 'admin']), async (c) => {
  const postId = c.req.param('id') || '';
  const loggedInUser = c.get('user')!;
  const body = await c.req.json();
  const input = validateRequest(updatePostSchema, body);

  const [existingPost] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!existingPost) {
    throw new NotFoundError(`Blog post with ID '${postId}' not found`);
  }

  // Author must own the post, or user must be admin
  if (existingPost.authorId !== loggedInUser.id && loggedInUser.role !== 'admin') {
    throw new AuthorizationError('Insufficient permissions to modify this post');
  }

  const updateData: Partial<typeof postsTable.$inferInsert> = {
    ...input,
    updatedAt: new Date(),
  };

  if (input.title) {
    const baseSlug = createSlug(input.title);
    const slugSuffix = randomBytes(4).toString('hex');
    updateData.slug = `${baseSlug}-${slugSuffix}`;
  }

  const [updatedPost] = await db
    .update(postsTable)
    .set(updateData)
    .where(eq(postsTable.id, postId))
    .returning();

  return c.json(createSuccessResponse(updatedPost), 200);
});

// POST /api/v1/posts/:id/publish -> Publish post (author/admin only)
postsRouter.post('/:id/publish', authMiddleware(['author', 'admin']), async (c) => {
  const postId = c.req.param('id') || '';
  const loggedInUser = c.get('user')!;

  const [existingPost] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!existingPost) {
    throw new NotFoundError(`Blog post with ID '${postId}' not found`);
  }

  if (existingPost.authorId !== loggedInUser.id && loggedInUser.role !== 'admin') {
    throw new AuthorizationError('Insufficient permissions to publish this post');
  }

  const [publishedPost] = await db
    .update(postsTable)
    .set({
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(postsTable.id, postId))
    .returning();

  if (!publishedPost) {
    throw new NotFoundError(`Failed to publish post: blog post with ID '${postId}' not found`);
  }

  // In-process notification: Simulating simple notification generation by printing a log
  // (In a full app, this might insert a notification row or send an email synchronously/asynchronously)
  console.log(
    JSON.stringify({
      level: 'info',
      message: 'Blog post published, sending notification',
      postId: publishedPost.id,
      authorId: publishedPost.authorId,
    })
  );

  return c.json(createSuccessResponse(publishedPost), 200);
});

// DELETE /api/v1/posts/:id -> Delete post (author/admin only)
postsRouter.delete('/:id', authMiddleware(['author', 'admin']), async (c) => {
  const postId = c.req.param('id') || '';
  const loggedInUser = c.get('user')!;

  const [existingPost] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!existingPost) {
    throw new NotFoundError(`Blog post with ID '${postId}' not found`);
  }

  if (existingPost.authorId !== loggedInUser.id && loggedInUser.role !== 'admin') {
    throw new AuthorizationError('Insufficient permissions to delete this post');
  }

  await db.delete(postsTable).where(eq(postsTable.id, postId));

  return c.json(createSuccessResponse({ message: 'Post deleted successfully' }), 200);
});
