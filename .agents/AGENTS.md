# PROJECT-SCOPED AGENT RULES

## Repository-Driven Context Engineering Mandate
1. **Pre-Execution Context Check**: Before implementing features or fixing bugs in any service or package, read the respective `CONTEXT.md` file located within that directory and the root system documentation in `docs/context/`.
2. **Post-Execution Synchronization**: If your code changes affect database tables, API signatures, RabbitMQ events, or system architecture, update the relevant `CONTEXT.md` documents before finishing your task.
3. **No Direct Driver Imports**: Ensure microservice code in `apps/` imports infrastructure only through `@platform/*` packages (`@platform/database`, `@platform/redis`, `@platform/messaging`, `@platform/logger`, `@platform/observability`).
