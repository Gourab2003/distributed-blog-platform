import type { ApiSuccessResponse } from "../types/api-success-response.js";

interface SuccessResponseOptions {
    readonly message?: string;
}

export const createSuccessResponse = <T>(
    data: T,
    options?: SuccessResponseOptions

): ApiSuccessResponse<T> => {
    return {
        success: true,
        data,
        ...(options?.message ? {message: options.message} : {})
    };
};