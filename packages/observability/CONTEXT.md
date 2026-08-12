# PACKAGE CONTEXT: OBSERVABILITY (`@platform/observability`)

## 1. Domain Responsibilities
The `@platform/observability` package provides OpenTelemetry distributed tracing and metrics abstractions.

Key Responsibilities:
- **SDK Initialization**: `initObservability(config)` initializing OpenTelemetry Node SDK, OTLP exporters, and auto-instrumentations.
- **Trace Context Propagation**: W3C `traceparent` extraction and injection across HTTP requests and RabbitMQ AMQP message headers.
- **Custom Span Helpers**: `withSpan(spanName, fn)` for creating child spans around database queries or external API calls.
