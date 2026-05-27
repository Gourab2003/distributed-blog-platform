import type { TelemetryContext } from '../types/telemetry-context.js';

import {
    TRACE_ID_HEADER,
    SPAN_ID_HEADER,
    CORRELATION_ID_HEADER,
} from './headers.js';

export interface HeaderCarrier {
    get(name: string): string | null | undefined;
}

export const extractTelemetryContext = (
    carrier: HeaderCarrier,
): TelemetryContext => {
    const traceId = carrier.get(TRACE_ID_HEADER);

    const spanId = carrier.get(SPAN_ID_HEADER);

    const correlationId = carrier.get(CORRELATION_ID_HEADER);

    return {
        ...(traceId ? { traceId } : {}),
        ...(spanId ? { spanId } : {}),
        ...(correlationId ? { correlationId } : {}),
    };
};