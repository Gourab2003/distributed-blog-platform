import { InfrastructureError } from "@platform/errors";
import { EventEnvelope } from "../types/event-envelope.js";

export function SerializeEnevt(event: Omit<EventEnvelope, 'occurredAt'>) : Buffer {
    try {
        const fullEnvelope: EventEnvelope = {
            ...event,
            occurredAt: new Date().toString(),
        };
        return Buffer.from(JSON.stringify(fullEnvelope), 'utf8');
    } catch (error) {
        throw new InfrastructureError('Messaging layar failed to serilize event envelope', {
            cause: error instanceof Error ? error.message : String(error),
        });
    }
}