import type { MessagingTopologyDefinition } from '../types/messaging-options.js';

export interface TopologyManager {
    readonly assert: (definition: MessagingTopologyDefinition) => Promise<void>;
}
