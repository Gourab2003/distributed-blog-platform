import type { MessagingConfiguration } from '@platform/configuration';
import type { PlatformLogger } from '@platform/logger';

export interface QueueBindingDefinition {
    readonly queue: string;
    readonly routingKey: string;
}

export interface MessagingTopologyDefinition {
    readonly exchange: string;
    readonly queues: readonly string[];
    readonly bindings: readonly QueueBindingDefinition[];
}

export interface MessagingRuntimeOptions {
    readonly config: MessagingConfiguration;
    readonly logger: PlatformLogger;
    readonly topology: MessagingTopologyDefinition;
}
