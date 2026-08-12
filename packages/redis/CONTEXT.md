# PACKAGE CONTEXT: REDIS (`@platform/redis`)

## 1. Domain Responsibilities
The `@platform/redis` package wraps `ioredis` for caching, session management, rate limiting, and distributed locking.

Key Responsibilities:
- **Managed Client Runtime**: `createRedisRuntime` implementing `@platform/runtime` LifecycleResource for connection management and health checks.
- **Cache Abstraction**: Typed `get`, `set`, `del`, `mget`, `expire` operations with TTL support.
- **Distributed Locking**: Redlock pattern implementation (`acquireLock`, `releaseLock`) for cross-service concurrency control.
- **Pub/Sub Primitives**: Redis pub/sub wrapper for lightweight real-time events.
