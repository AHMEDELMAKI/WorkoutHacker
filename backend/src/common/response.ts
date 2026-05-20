import { Response } from 'express';

/**
 * Standardized API response format for all endpoints.
 * { success, message, data, error }
 */

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string | null;
    errors?: Array<{ msg: string; param?: string }>;
}

export function sendSuccess<T>(
    res: Response,
    data: T,
    message = 'OK',
    statusCode = 200,
): Response {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        error: null,
    } satisfies ApiResponse<T>);
}

export function sendCreated<T>(res: Response, data: T, message = 'Created'): Response {
    return sendSuccess(res, data, message, 201);
}

export function sendError(
    res: Response,
    error: string,
    statusCode = 500,
    errors?: any[],
): Response {
    return res.status(statusCode).json({
        success: false,
        message: error,
        data: null,
        error,
        ...(errors ? { errors } : {}),
    } satisfies ApiResponse);
}
