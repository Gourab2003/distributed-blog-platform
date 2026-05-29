import { encodeCursor } from './encode-cursor.js';

interface CursorPaginationMetaInput {
    readonly items: readonly { readonly id: string; readonly createdAt: string }[];
    readonly limit: number;
    readonly requestedLimit: number;
}

interface CursorPaginationMetaOutput {
    readonly nextCursor?: string;
    readonly hasMore: boolean;
}

export function createCursorPaginationMeta(
    input: CursorPaginationMetaInput,
): CursorPaginationMetaOutput {
    const hasMore =
        input.items.length > 0 && input.items.length === input.requestedLimit;

    if (!hasMore) {
        return { hasMore: false };
    }

    const lastItem = input.items[input.items.length - 1];

    if (!lastItem) {
        return { hasMore: false };
    }

    return {
        hasMore: true,
        nextCursor: encodeCursor(lastItem.id, lastItem.createdAt),
    };
}