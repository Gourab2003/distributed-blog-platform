import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().int().min(1).max(65535).default(3000),
  nodeEnv: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  database: z.object({
    url: z.string().min(1, 'DATABASE_URL is required'),
  }),
  redis: z.object({
    url: z.string().optional(),
  }),
  jwt: z.object({
    secret: z.string().min(1, 'JWT_SECRET is required'),
    issuer: z.string().default('blog-platform'),
    audience: z.string().default('blog-platform-users'),
    accessTokenTtl: z.string().default('15m'),
    refreshTokenTtl: z.string().default('7d'),
  }),
});

// Transformed from process.env keys
const rawConfig = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
  },
};

const result = configSchema.safeParse(rawConfig);

if (!result.success) {
  console.error('❌ Configuration validation failed:', JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

export const config = result.data;
export type Config = typeof config;
