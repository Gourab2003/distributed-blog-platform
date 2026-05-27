export { initObservability } from './bootstrap/init-observability.js';

export {
    getTelemetryContext,
    runWithTelemetryContext,
    setTelemetryContext,
} from './context/telemetry-context.js';

export {
    extractTelemetryContext,
} from './propagation/extract-context.js';

export {
    injectTelemetryContext,
} from './propagation/inject-context.js';

export {
    TRACE_ID_HEADER,
    SPAN_ID_HEADER,
    CORRELATION_ID_HEADER,
} from './propagation/headers.js';

export type { ObservabilityOptions } from './types/observability-options.js';

export type { ObservabilityRuntime } from './types/observability-runtime.js';

export type { TelemetryContext } from './types/telemetry-context.js';

export type { TracingProvider } from './types/tracing-provider.js';