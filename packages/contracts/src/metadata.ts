export interface EventMetadata {
    readonly eventId: string;
    readonly version: number;
    readonly occurredAt: string;
    readonly producer: string;
    readonly correlationId?: string;
    readonly causationId?: string;
}