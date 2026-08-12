import { Hono } from 'hono';
import type { AppVariables } from '../middleware/index.js';
import { pingDatabase } from '../db/client.js';
import { createSuccessResponse } from '../utils/response.js';

export const healthRouter = new Hono<{ Variables: AppVariables }>();

// Liveness check
healthRouter.get('/live', (c) => {
  return c.json(createSuccessResponse({ status: 'OK' }), 200);
});

// Readiness check
healthRouter.get('/ready', async (c) => {
  try {
    await pingDatabase();
    return c.json(createSuccessResponse({ status: 'ready', services: { database: 'up' } }), 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Readiness check failed',
        },
      },
      503
    );
  }
});
