import type { AmqpChannel } from '../transport/rabbitmq/channel.js';
import type { MessagingTopologyDefinition } from '../types/messaging-options.js';


export async function assertTopology(
    channel: AmqpChannel,
    definition: MessagingTopologyDefinition,
): Promise<void> {
    await channel.assertExchange(definition.exchange, 'topic', {
        durable: true,
        autoDelete: false,
    });

    for (const queue of definition.queues) {
        await channel.assertQueue(queue, {
            durable: true,
            autoDelete: false,
        });
    }

    for (const binding of definition.bindings) {
        await channel.bindQueue(binding.queue, definition.exchange, binding.routingKey);
    }
}
