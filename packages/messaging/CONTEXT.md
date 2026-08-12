# PACKAGE CONTEXT: MESSAGING (`@platform/messaging`)

## 1. Domain Responsibilities
The `@platform/messaging` package encapsulates RabbitMQ AMQP messaging functionality. Services interact with RabbitMQ solely via `@platform/messaging`.

Key Responsibilities:
- **Topology Assertion**: Declares topic exchanges (`user.events`, `blog.events`, `interaction.events`), queues, and dead-letter exchanges (`dlx.events`).
- **Publisher Primitives**: `publishEvent<T>(exchange, routingKey, payload, metadata)` with automatic JSON serialization and OpenTelemetry trace propagation.
- **Consumer Primitives**: `createConsumer<T>(queueName, options, handler)` supporting message acknowledgment (`ack`), rejection (`nack`), and retries with exponential backoff.
- **Lifecycle Integration**: Implements `@platform/runtime` LifecycleResource interface for managed connection cleanup.
