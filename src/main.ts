import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { config } from './config.js';
import { closeDatabase, pingDatabase } from './db/client.js';
import {
  requestIdMiddleware,
  requestTimingMiddleware,
  errorHandlerMiddleware,
} from './middleware/index.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { postsRouter } from './routes/posts.js';
import { commentsRouter } from './routes/comments.js';
import { healthRouter } from './routes/health.js';

const app = new Hono();

// ── Global Middlewares ───────────────────────────────────────────────────────

app.use('*', requestIdMiddleware());
app.use('*', requestTimingMiddleware());
app.use('*', errorHandlerMiddleware());

// ── Route Registrations ──────────────────────────────────────────────────────

app.route('/api/v1/auth', authRouter);
app.route('/api/v1/users', usersRouter);
app.route('/api/v1/posts', postsRouter);
app.route('/api/v1/posts', commentsRouter); // Handles post likes and comments
app.route('/health', healthRouter);

// ── Server Bootstrap ─────────────────────────────────────────────────────────

async function bootstrap() {
  try {
    // Verify database connection at startup
    await pingDatabase();
    console.log('Database connectivity verified');

    const server = serve({
      fetch: app.fetch,
      port: config.port,
    });

    console.log(`Server started running on port ${config.port} in ${config.nodeEnv} mode`);

    // Graceful Shutdown orchestration
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}, initiating graceful shutdown...`);
      server.close();
      await closeDatabase();
      console.log('Server and database resources cleaned up. Exiting.');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
export default app;
