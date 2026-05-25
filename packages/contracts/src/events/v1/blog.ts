import type { EventMetadata } from '../../metadata.js';

export interface BlogPostCreatedEvent {
    readonly metadata: EventMetadata;
    readonly payload: {
        readonly id: string;
        readonly title: string;
        readonly authorId: string;
        readonly createdAt: string;
    };
}