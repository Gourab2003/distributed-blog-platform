import { randomUUID } from 'node:crypto';
import type { Context, Next } from 'hono';
import { PlatformError, AuthenticationError } from '../utils/errors.js';
import { verifyAccessToken, type UserRole } from '../utils/auth.js';
import { config } from '../config.js';
import { createErrorResponse } from '../utils/response.js';

export interface AppVariables {
  requestId: string;
  startTime: number;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const requestIdMiddleware = () => {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const existingRequestId = c.req.header('x-request-id');
    const requestId = existingRequestId || randomUUID();
    c.set('requestId', requestId);
    c.header('x-request-id', requestId);
    await next();
  };
};

export const requestTimingMiddleware = () => {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    c.set('startTime', performance.now());
    await next();
  };
};

export const errorHandlerMiddleware = () => {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    try {
      await next();
    } catch (error) {
      const requestId = c.get('requestId');
      const startTime = c.get('startTime');
      const durationMs = startTime ? Math.round(performance.now() - startTime) : undefined;

      console.error(
        JSON.stringify({
          level: 'error',
          message: 'Unhandled request error',
          error: error instanceof Error ? error.stack || error.message : String(error),
          requestId,
          durationMs,
          method: c.req.method,
          path: c.req.path,
        })
      );

      if (error instanceof PlatformError) {
        // Map common errors to appropriate HTTP status codes
        let status = 500;
        if (error.code === 'AUTHENTICATION_FAILED') status = 401;
        else if (error.code === 'AUTHORIZATION_FAILED') status = 403;
        else if (error.code === 'RESOURCE_NOT_FOUND') status = 404;
        else if (error.code === 'VALIDATION_FAILED') status = 400;

        return c.json(createErrorResponse(error.code, error.message, requestId), status as any);
      }

      return c.json(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', requestId), 500);
    }
  };
};

export const authMiddleware = (requiredRoles?: UserRole[]) => {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('Token not found in authorization header');
    }

    const claims = verifyAccessToken({
      token,
      secret: config.jwt.secret,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    if (requiredRoles && !requiredRoles.includes(claims.role)) {
      throw new AuthenticationError('Access denied: insufficient permissions');
    }

    c.set('user', {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
    });

    await next();
  };
};
