export interface ApiErrorDetails {
    readonly code: string;
    readonly message: string;
    readonly requestId?: string;
}

export interface ApiErrorResponse {
    readonly success: false;
    readonly error: ApiErrorDetails;
}