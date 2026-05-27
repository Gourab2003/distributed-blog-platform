import type { Hono } from 'hono';
import type { HttpVariables } from './http-context.js';

export type HttpApp = Hono<{
    Variables: HttpVariables;
}>;