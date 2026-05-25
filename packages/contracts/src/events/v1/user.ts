import type { EventMetadata } from '../../metadata.js';

export interface UserCreatedEvent {
    readonly metadata: EventMetadata;
    readonly payload: {
        readonly id: string;
        readonly email: string;
        readonly username: string;
        readonly createdAt: string;
    };
}