import { Hono } from 'hono';
import { eq, or } from 'drizzle-orm';
import { createSuccessResponse } from '@platform/http';
import { ValidationError } from '@platform/errors';
import { validateRequest, registerSchema } from '@platform/validation';
import { usersTable } from '@platform/database/schema';

// Import the AppVariables type you just defined
import type { AppVariables } from '../bootstrap/create-http-app.js';

export function registerAuthRoutes(app: Hono<{ Variables: AppVariables }>) {
    const authRouter = new Hono<{ Variables: AppVariables }>();

    authRouter.post('/register', async (c) => {
        const body = await c.req.json();
        const input = validateRequest(registerSchema, body);

        // Resolve dependencies lazily per request
        const db = c.get('getDb')();
        // const redis = c.get('getRedis')(); // Available if needed

        // 1. Check for existing user
        const existingUser = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(or(eq(usersTable.email, input.email), eq(usersTable.username, input.userName)))
            .limit(1);

        if (existingUser.length > 0) {
            throw new ValidationError('Email or username is already in use');
        }

        // ... rest of the transaction logic using `db` instead of `runtime.db` ...

        return c.json(createSuccessResponse({ success: true }), 201);
    });

    app.route('/api/v1/auth', authRouter);
}