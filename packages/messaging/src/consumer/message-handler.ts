import type { AmqpChannel } from "../transport/rabbitmq/channel.js";
import type { Message } from "amqplib";
import type { PlatformLogger } from "@platform/logger";
import { deserializeEvent } from "../serialization/deserialize-event.js";
import type { MessageHandler } from "./consumer-types.js";

interface WrapHandlerOptions {
    readonly channel: AmqpChannel,
    readonly handler: MessageHandler,
    readonly logger: PlatformLogger,
    readonly onProcessingStart: () => void;
    readonly onProcessingEnd: () => void;
}

export function wrapMessageHandler(
    options: WrapHandlerOptions, 
): (msg: Message | null) => void {
    const { channel, handler, logger, onProcessingStart, onProcessingEnd } = options;

    return (msg: Message | null) : void => {
        if(!msg) return;

        onProcessingStart();

        (async () => {
            try {
                const envelope = deserializeEvent(msg.content);

                await handler(envelope, {
                    routingKey: msg.fields.routingKey,
                });

                channel.ack(msg);
            } catch (error) {
                logger.error('Failed to process message cleanly', {
                    routingKey: msg.fields.routingKey,
                    error: error instanceof Error ? error.message : String(error),
                });

                channel.nack(msg, false, false);
            } finally {
                onProcessingEnd();
            }
        })();
    }
}