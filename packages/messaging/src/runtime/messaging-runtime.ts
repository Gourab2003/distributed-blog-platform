import { InfrastructureError } from '@platform/errors';
import type { PlatformLogger } from '@platform/logger';
import { createAmqpConnection, type AmqpConnection } from '../transport/rabbitmq/connection.js';
import { createAmqpChannel, type AmqpChannel } from '../transport/rabbitmq/channel.js';
import { assertTopology } from '../topology/assert-topology.js';
import { createPublisher } from '../publisher/create-publisher.js';
import { createConsumer } from '../consumer/create-consumer.js';
import type { EventPublisher } from '../publisher/publisher-types.js';
import type { EventConsumer } from '../consumer/consumer-types.js';
import type { MessagingRuntimeOptions } from '../types/messaging-options.js';

export interface MessagingRuntime {
    readonly start: () => Promise<void>;
    readonly stop: () => Promise<void>;
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
    let isShuttingDown = false;

    return {
        async start(): Promise<void> {
            logger.info('Initializing Messaging Runtime Infrastructure...');
            
            connection = await createAmqpConnection(config);
            
            // Phase 1 constraint: separate publisher/consumer channels
            publisherChannel = await createAmqpChannel(connection);
            consumerChannel = await createAmqpChannel(connection);

            // Execute topology configuration declarations via the publisher context
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

            logger.info('Messaging Runtime started successfully.');
        },

        async stop(): Promise<void> {
            if (isShuttingDown) return;
            isShuttingDown = true;

            logger.info('Graceful messaging runtime shutdown initiated...');

            // 1. Cancel consumer operations from fetching further workloads
            if (consumerChannel && consumerTags.length > 0) {
                for (const tag of consumerTags) {
                    await consumerChannel.cancel(tag).catch((err) => 
                        logger.warn(`Failed cancelling tag: ${tag}`, {
                            metadata: { error: String(err) },
                        })
                    );
                }
            }

            // 2 & 3. Draining loop monitoring active in-flight worker promises
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

            // 5. Close Channels
            if (publisherChannel) {
                await publisherChannel.close().catch(() => {});
            }
            if (consumerChannel) {
                await consumerChannel.close().catch(() => {});
            }

            // 6. Close Connection
            if (connection) {
                await connection.close().catch(() => {});
            }

            logger.info('Messaging connection cleanup finalized complete.');
        },

        getPublisher(): EventPublisher {
            if (!publisher) {
                throw new InfrastructureError('Messaging runtime has not been initialized. Call start() first.');
            }
            return publisher;
        },

        getConsumer(): EventConsumer {
            if (!consumer) {
                throw new InfrastructureError('Messaging runtime has not been initialized. Call start() first.');
            }
            return consumer;
        },
    };
}
