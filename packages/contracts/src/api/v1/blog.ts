import type { EntityId, ISODateString, BlogPostStatus } from '../../domain/index.js';
import type { CursorPaginationRequest, CursorPaginationMeta } from './common.js';

export interface CreateBlogPostRequest {
    readonly title: string;
    readonly content: string;
    readonly summary?: string;
    readonly tags?: readonly string[];
}

export interface UpdateBlogPostRequest {
    readonly title?: string;
    readonly content?: string;
    readonly summary?: string;
    readonly tags?: readonly string[];
    readonly status?: BlogPostStatus;
}

export interface BlogPostResponse {
    readonly id: EntityId;
    readonly authorId: EntityId;
    readonly slug: string;
    readonly title: string;
    readonly content: string;
    readonly summary: string | null;
    readonly status: BlogPostStatus;
    readonly tags: readonly string[];
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly publishedAt: ISODateString | null;
}

export interface GetBlogPostsQuery extends CursorPaginationRequest {
    readonly authorId?: EntityId;
    readonly status?: BlogPostStatus;
    readonly tag?: string;
}

export interface PaginatedBlogPostsResponse {
    readonly items: readonly BlogPostResponse[];
    readonly meta: CursorPaginationMeta;
}
