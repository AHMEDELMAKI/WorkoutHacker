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
    errors?: Array<{
        msg: string;
        param?: string;
    }>;
}
export declare function sendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
export declare function sendCreated<T>(res: Response, data: T, message?: string): Response;
export declare function sendError(res: Response, error: string, statusCode?: number, errors?: any[]): Response;
//# sourceMappingURL=response.d.ts.map