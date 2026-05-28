import type { AmqpChannel } from "../transport/rabbitmq/channel.js";
import type { EventEnvelope } from "../types/event-envelope.js";
import { serializeEvent } from "../serialization/serialize-event.js";
import type { EventPublisher } from "./publisher-types.js";



export function createPublisher(
    channel: AmqpChannel,
    exchangeName: string
): EventPublisher {
    return {
        publish: async (
            routingKey: string,
            event: Omit<EventEnvelope, 'occurredAt'>,
        ): Promise<void> => {
            const buffer = serializeEvent(event);
            channel.publish(exchangeName, routingKey, buffer, {
                persistent: true,
                deliveryMode: 2,
            })
        }
    }
}