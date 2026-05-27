import { RequestContextKeys } from './request-context-keys.js';
import type { Context } from 'hono';
import type { PlatformLogger } from '@platform/logger';

export const getRequestLogger = (c: Context): PlatformLogger => {
    return c.get(RequestContextKeys.LOGGER);
};