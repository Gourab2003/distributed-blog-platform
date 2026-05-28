import { InfrastructureError } from "@platform/errors";
import { EventEnvelope } from "../types/event-envelope.js";

export function deserializeEvent(buffer: Buffer): EventEnvelope {
    try {
        return JSON.parse(buffer.toString('utf8')) as EventEnvelope;
    } catch (error) {
        throw new InfrastructureError('Messaging layer failed to deserialize incoming event envelope',{
            cause: error instanceof Error ? error.message: String(error),
        });
    }
}