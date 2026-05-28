import type { EntityId, ISODateString, BlogPostStatus } from '../../domain/index.js';

export interface BlogPostCreatedEventPayload {
    readonly id: EntityId;
    readonly authorId: EntityId;
    readonly slug: string;
    readonly title: string;
    readonly status: BlogPostStatus;
    readonly createdAt: ISODateString;
}

export interface BlogPostUpdatedEventPayload {
    readonly id: EntityId;
    readonly authorId: EntityId;
    readonly slug: string;
    readonly title: string;
    readonly status: BlogPostStatus;
    readonly updatedAt: ISODateString;
}

export interface BlogPostPublishedEventPayload {
    readonly id: EntityId;
    readonly authorId: EntityId;
    readonly slug: string;
    readonly publishedAt: ISODateString;
}

export interface BlogPostDeletedEventPayload {
    readonly id: EntityId;
    readonly authorId: EntityId;
    readonly deletedAt: ISODateString;
}
