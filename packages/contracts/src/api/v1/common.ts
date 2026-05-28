export interface CursorPaginationRequest {
    readonly cursor?: string;
    readonly limit?: number;
}

export interface CursorPaginationMeta {
    readonly nextCursor?: string;
    readonly hasMore: boolean;
}

export interface ApiSuccessResponse<T> {
    readonly success: true;
    readonly data: T;
}

export interface ApiErrorResponse {
    readonly success: false;
    readonly error: {
        readonly code: string;
        readonly message: string;
    };
}

export type ApiResponse<T> =

    | ApiSuccessResponse<T>
    | ApiErrorResponse;
