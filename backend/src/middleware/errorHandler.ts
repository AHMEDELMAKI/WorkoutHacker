import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    logger.error(`[${statusCode}] ${message}`, { stack: err.stack });

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
};

export function createError(message: string, statusCode: number): AppError {
    const err: AppError = new Error(message);
    err.statusCode = statusCode;
    return err;
}
