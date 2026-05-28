import type { EventEnvelope } from "../types/event-envelope.js";

export interface MessageContext {
    readonly routingKey: string;
};

export type MessageHandler = (
    event: EventEnvelope,
    context: MessageContext,
) => Promise<void>;

export interface EventConsumer {
    readonly consume: (queueName: string, handler: MessageHandler) => Promise<void>;
}