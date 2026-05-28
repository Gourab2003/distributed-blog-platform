import type { EventEnvelope } from "../types/event-envelope.js";

export interface EventPublisher {
    readonly publish: (routingKey: string, event: Omit<EventEnvelope, 'occurredAt'>) =>Promise<void>;
}