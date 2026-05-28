import amqplib from 'amqplib';
import { InfrastructureError } from '@platform/errors';
import type { MessagingConfiguration } from '@platform/configuration';

export type AmqpConnection = amqplib.ChannelModel;

export async function createAmqpConnection(
    configuration: MessagingConfiguration
): Promise<AmqpConnection> {
    try {
        const connection = await amqplib.connect(configuration.url);
        return connection;
    } catch (error) {
        throw new InfrastructureError('Failed to establish RabbitMQ transport connection', {
            cause: error instanceof Error ? error.message : String(error),
        })
    }
}