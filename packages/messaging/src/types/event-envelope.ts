export interface EventEnvelope<TPayload = unknown> {
    readonly type: string;
    readonly version: number;
    readonly occurredAt: string;
    readonly correlationId?: string;
    readonly payload: TPayload;
}
