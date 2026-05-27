import type { TelemetryContext } from '../types/telemetry-context.js';

import {
    TRACE_ID_HEADER,
    SPAN_ID_HEADER,
    CORRELATION_ID_HEADER,
} from './headers.js';

export interface MutableHeaderCarrier {
    set(name: string, value: string): void;
}

export const injectTelemetryContext = (
    context: TelemetryContext,
    carrier: MutableHeaderCarrier,
): void => {
    if (context.traceId) {
        carrier.set(TRACE_ID_HEADER, context.traceId);
    }

    if (context.spanId) {
        carrier.set(SPAN_ID_HEADER, context.spanId);
    }

    if (context.correlationId) {
        carrier.set(CORRELATION_ID_HEADER, context.correlationId);
    }
};