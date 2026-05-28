import type { AmqpChannel } from '../transport/rabbitmq/channel.js';
import type { PlatformLogger } from '@platform/logger';
import type { EventConsumer, MessageHandler } from './consumer-types.js';
import { wrapMessageHandler } from './message-handler.js';

interface ConsumerDependencies {
    readonly channel: AmqpChannel;
    readonly logger: PlatformLogger;
    readonly prefetchCount: number;
    readonly onProcessingStart: () => void;
    readonly onProcessingEnd: () => void;
    readonly registerConsumerTag: (tag: string) => void;
}

export function createConsumer(dependencies: ConsumerDependencies): EventConsumer {
    const {
        channel,
        logger,
        prefetchCount,
        onProcessingStart,
        onProcessingEnd,
        registerConsumerTag,
    } = dependencies;

    return {
        async consume(queueName: string, handler: MessageHandler): Promise<void> {
            await channel.prefetch(prefetchCount);

            const amqpHandler = wrapMessageHandler({
                channel,
                handler,
                logger,
                onProcessingStart,
                onProcessingEnd,
            });

            const response = await channel.consume(queueName, amqpHandler, {
                noAck: false,
            });

            registerConsumerTag(response.consumerTag);
        },
    };
}
