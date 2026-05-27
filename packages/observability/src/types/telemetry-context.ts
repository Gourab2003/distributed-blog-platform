export interface TelemetryContext {
    readonly traceId?: string;
    readonly spanId?: string;
    readonly correlationId?: string;
}