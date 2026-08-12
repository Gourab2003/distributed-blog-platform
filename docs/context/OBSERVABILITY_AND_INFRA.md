# OBSERVABILITY & INFRASTRUCTURE SPECIFICATIONS

## 1. Overview
The platform enforces production-grade logging, error isolation, and operational health checks, simplified to run as a unified monolithic container or process.

---

## 2. Telemetry & Infrastructure Architecture

```
[ Client Request ]
       │
       ▼
 ┌───────────┐
 │   Hono    │ (Structured stdout/stderr JSON Logs)
 │ Monolith  │
 └─────┬─────┘
       │
       ▼
 ┌───────────┐
 │PostgreSQL │ (Unified Database Storage)
 └───────────┘
```

---

## 3. Telemetry Specifications

### A. Structured Logging
- **Engine**: Node.js `console.log` and `console.error` writing structured JSON directly to standard output/error.
- **Context Injection**: Each JSON log automatically includes `requestId`, `method`, `path`, and operation `durationMs` extracted by the Hono middleware.
- **Log Aggregator**: Standard container log collectors (like Grafana Loki, FluentBit, or AWS CloudWatch) scrape stdout/stderr stream directly.

### B. Health Probes
- **Liveness Probe (`GET /health/live`)**: Simple probe returning process status to the container manager (Kubernetes / ECS).
- **Readiness Probe (`GET /health/ready`)**: Probe checking connection health by executing a ping against PostgreSQL before returning `200 OK`.
