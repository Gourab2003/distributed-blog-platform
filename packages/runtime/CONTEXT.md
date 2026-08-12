# PACKAGE CONTEXT: RUNTIME (`@platform/runtime`)

## 1. Domain Responsibilities
The `@platform/runtime` package is the core application lifecycle engine. It orchestrates sequential service startup, health monitoring, and graceful termination.

Key Responsibilities:
- **Lifecycle Manager**: `createLifecycleManager(logger)` to register and manage `LifecycleResource` instances (`dbRuntime`, `redisRuntime`, `httpRuntime`, `messagingRuntime`).
- **Sequential Startup**: Bootstraps registered resources sequentially (`startAll()`).
- **Graceful Shutdown**: On process signals (`SIGINT`, `SIGTERM`), stops resources in reverse order (`stopAll()`) with rollback on failure and timeout guarantees.
- **Process Signals**: `registerProcessSignals` listening for uncaught exceptions, unhandled rejections, and termination signals.

---

## 2. Core Interface
```ts
export interface LifecycleResource {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck?(): Promise<boolean>;
}
```
