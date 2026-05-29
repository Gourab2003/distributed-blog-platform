import { InfrastructureError } from '@platform/errors';
import type { RuntimeResource, RuntimeState } from '@platform/runtime';
import { createAmqpConnection, type AmqpConnection } from '../transport/rabbitmq/connection.js';
import { createAmqpChannel, type AmqpChannel } from '../transport/rabbitmq/channel.js';
import { assertTopology } from '../topology/assert-topology.js';
import { createPublisher } from '../publisher/create-publisher.js';
import { createConsumer } from '../consumer/create-consumer.js';
import type { EventPublisher } from '../publisher/publisher-types.js';
import type { EventConsumer } from '../consumer/consumer-types.js';
import type { MessagingRuntimeOptions } from '../types/messaging-options.js';

export interface MessagingRuntime extends RuntimeResource {
    readonly getPublisher: () => EventPublisher;
    readonly getConsumer: () => EventConsumer;
}

export function createMessagingRuntime(options: MessagingRuntimeOptions): MessagingRuntime {
    const { config, logger, topology } = options;

    let connection: AmqpConnection | null = null;
    let publisherChannel: AmqpChannel | null = null;
    let consumerChannel: AmqpChannel | null = null;

    let publisher: EventPublisher | null = null;
    let consumer: EventConsumer | null = null;

    const consumerTags: string[] = [];
    let inFlightMessagesCount = 0;
    let state: RuntimeState = 'idle';

    return {
        name: 'messaging',

        get state(): RuntimeState {
            return state;
        },

        async start(): Promise<void> {
            if (state !== 'idle') return;
            state = 'starting';

            try {
                logger.info('Initializing Messaging Runtime Infrastructure...');

                connection = await createAmqpConnection(config);

                publisherChannel = await createAmqpChannel(connection);
                consumerChannel = await createAmqpChannel(connection);

                await assertTopology(publisherChannel, topology);

                publisher = createPublisher(publisherChannel, topology.exchange);
                consumer = createConsumer({
                    channel: consumerChannel,
                    logger,
                    prefetchCount: config.prefetchCount,
                    onProcessingStart: () => { inFlightMessagesCount++; },
                    onProcessingEnd: () => { inFlightMessagesCount--; },
                    registerConsumerTag: (tag) => { consumerTags.push(tag); },
                });

                state = 'started';
                logger.info('Messaging Runtime started successfully.');
            } catch (error) {
                state = 'stopped';
                throw new InfrastructureError('Failed to start messaging runtime', {
                    cause: error instanceof Error ? error.message : String(error)
                });
            }
        },

        async shutdown(): Promise<void> {
            if (state === 'idle' || state === 'stopped') return;
            state = 'shutting-down';

            logger.info('Graceful messaging runtime shutdown initiated...');

            try {
                if (consumerChannel && consumerTags.length > 0) {
                    for (const tag of consumerTags) {
                        await consumerChannel.cancel(tag).catch((err) =>
                            logger.warn(`Failed cancelling tag: ${tag}`, {
                                metadata: {
                                    error: String(err)
                                }
                            })
                        );
                    }
                }

                const shutdownTimeoutMs = 10000;
                const checkIntervalMs = 100;
                const startTime = Date.now();

                while (inFlightMessagesCount > 0) {
                    if (Date.now() - startTime > shutdownTimeoutMs) {
                        logger.warn('Graceful drain timeout threshold exceeded. Forcing channel closure.');
                        break;
                    }
                    await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
                }

                if (publisherChannel) await publisherChannel.close().catch(() => { });
                if (consumerChannel) await consumerChannel.close().catch(() => { });
                if (connection) await connection.close().catch(() => { });

                state = 'stopped';
                logger.info('Messaging connection cleanup finalized.');
            } catch (error) {
                state = 'stopped';
                logger.error('Error during messaging shutdown', {
                    metadata: {
                        error: error instanceof Error ? error.message : String(error)
                    }
                });
            }
        },

        getPublisher(): EventPublisher {
            if (!publisher || state !== 'started') {
                throw new InfrastructureError('Messaging runtime has not been started. Call start() first.');
            }
            return publisher;
        },

        getConsumer(): EventConsumer {
            if (!consumer || state !== 'started') {
                throw new InfrastructureError('Messaging runtime has not been started. Call start() first.');
            }
            return consumer;
        },
    };
}