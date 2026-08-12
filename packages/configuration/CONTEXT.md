# PACKAGE CONTEXT: CONFIGURATION (`@platform/configuration`)

## 1. Domain Responsibilities
The `@platform/configuration` package enforces fail-fast environment validation using Zod. It ensures services crash immediately during bootstrap if required environment variables are missing or malformed.

Key Responsibilities:
- **Zod Schema Parsing**: Validating process environment variables against typed Zod schemas.
- **Nested Configuration**: Converting dot-notation env keys (`database.url`, `redis.url`, `jwt.secret`) into structured immutable configuration objects.
- **Secret Redaction**: Utility functions to safely redact sensitive strings in log outputs (`redactSecrets`).

---

## 2. Standard Environment Configuration Schema
```ts
export const baseConfigSchema = z.object({
  environment: z.enum(['development', 'staging', 'production', 'test']),
  port: z.coerce.number().default(3000),
  database: z.object({
    url: z.string().url(),
    maxConnections: z.coerce.number().default(10),
  }),
  redis: z.object({
    url: z.string().url(),
  }),
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string().default('15m'),
  }),
});
```

---

## 3. Usage Pattern in Services
```ts
import { loadConfiguration } from '@platform/configuration';

export const configuration = loadConfiguration(customSchema);
```
