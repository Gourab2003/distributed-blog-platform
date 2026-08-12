# OBSERVABILITY & INFRASTRUCTURE SPECIFICATIONS

## 1. Overview
The platform incorporates production-grade observability across structured logging, distributed tracing, metric collection, and edge routing.

---

## 2. Telemetry & Infrastructure Architecture

```
[ Client Request ]
       │
       ▼
 ┌───────────┐
 │   Nginx   │ (Reverse Proxy / Rate Limiting)
 └─────┬─────┘
       │
       ▼
 ┌───────────┐     Trace Context (W3C TraceParent Header)
 │api-gateway│ ────────────────────────────────────────┐
 └─────┬─────┘                                         │
       │                                               ▼
       ├───► [ auth-service ] ─────────► [ PostgreSQL / Redis ]
       │                                               │
       ├───► [ blog-service ] ─────────► [ RabbitMQ ]  │ Logs / Traces / Metrics
       │                                        │      │
       └───► [ notification-service ] ◄─────────┘      │
                                                       ▼
 ┌────────────────────────────────────────────────────────┐
 │           Observability Collectors & Storage           │
 │  • Loki (Logs)  • Tempo (Traces)  • Prometheus (Metrics)│
 └──────────────────────────┬─────────────────────────────┘
                            ▼
                   ┌─────────────────┐
                   │Grafana Dashboard│
                   └─────────────────┘
```

---

## 3. Component Telemetry Specifications

### A. Structured Logging (`@platform/logger`)
- **Engine**: Winston with JSON formatting.
- **Context Tracking**: Powered by Node.js `AsyncLocalStorage`. Automatically injects `correlationId`, `requestId`, `serviceName`, and `environment` into every log entry.
- **Log Aggregator**: Scraped by Grafana Loki from stdout/stderr.

### B. Distributed Tracing (`@platform/observability`)
- **Engine**: OpenTelemetry Node SDK.
- **Trace Propagation**: W3C `traceparent` HTTP headers & AMQP message properties across service boundaries.
- **Trace Collector**: Grafana Tempo listening on gRPC/HTTP OTLP endpoints.

### C. Metric Collection
- **Engine**: Prometheus Client.
- **Scrape Endpoints**: Standard `/metrics` route exported by HTTP runtime services.

### D. Reverse Proxy Edge Routing (`infra/nginx`)
- Centralized SSL termination, path-based routing (`/api/v1/auth`, `/api/v1/posts`), and connection rate limiting.
