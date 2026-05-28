import type { EntityId, ISODateString } from './domain/index.js';

export interface EventMetadata {
    readonly eventId: string;
    readonly version: number;
    readonly occurredAt: ISODateString;
    readonly producer: string;
    readonly correlationId?: string;
    readonly causationId?: string;
    readonly actorId?: EntityId;
}
