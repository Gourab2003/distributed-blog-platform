# INFRASTRUCTURE CONTEXT (`infra/`)

## 1. Executive Summary
The `infra/` directory manages configuration blueprints and provisioning specs for edge routing, observability, and container runtime orchestration.

---

## 2. Component Specifications

### A. Nginx Edge Reverse Proxy (`infra/nginx`)
- **Directory**: `infra/nginx/conf.d`
- **Port Mapping**: Host `80` / `443` ──► Proxies to `api-gateway:3000`.
- **Features**: SSL/TLS termination, request payload size limits, connection rate limiting, path rewriting.

### B. Grafana Observability Dashboards (`infra/grafana`)
- **Directory**: `infra/grafana/provisioning`
- **Port**: Host `3000` (UI)
- **Data Sources**: Automatically provisions Loki (Logs), Tempo (Traces), Prometheus (Metrics).

### C. Loki Log Aggregator (`infra/loki`)
- Receives structured JSON logs pushed from microservice stdout/stderr streams.

### D. Prometheus Metric Scraping (`infra/prometheus`)
- Periodically scrapes metrics from `/metrics` endpoints exposed across microservices.

### E. Tempo Distributed Tracing (`infra/tempo`)
- Receives OTLP gRPC/HTTP trace spans exported by `@platform/observability`.
