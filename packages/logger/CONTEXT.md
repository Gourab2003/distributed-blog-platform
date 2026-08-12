# PACKAGE CONTEXT: LOGGER (`@platform/logger`)

## 1. Domain Responsibilities
The `@platform/logger` package provides a structured JSON logging system powered by Winston and Node.js `AsyncLocalStorage`.

Key Responsibilities:
- **AsyncLocalStorage Context**: Automatically attaches `requestId`, `correlationId`, `serviceName`, and `userId` to every log line without passing logger instances through every function.
- **Log Levels**: `error`, `warn`, `info`, `http`, `debug`.
- **Sensitive Data Redaction**: Automatically redacts passwords, tokens, JWTs, and credit card keys in metadata objects.
- **Winston Transports**: Console stdout transport formatted as JSON for Loki ingestion.
