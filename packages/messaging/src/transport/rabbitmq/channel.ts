import type amqplib from 'amqplib';
import { InfrastructureError } from '@platform/errors';
import type { AmqpConnection } from './connection.js';

export type AmqpChannel = amqplib.Channel;

export async function createAmqpChannel(connection: AmqpConnection): Promise<AmqpChannel> {
    try {
        const channel = await connection.createChannel();
        return channel;
    } catch (error) {
        throw new InfrastructureError(
            'Failed to create amqplib transport channel',
            { cause: error instanceof Error ? error.message : String(error) },
        );
    }
}