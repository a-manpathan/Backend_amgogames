import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export const globalErrorHandler = (
    error: Error | HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(error.stack);

    const status = error instanceof HttpError ? error.status : 500;
    const message = error.message || 'Something went wrong';

    res.status(status).json({
        error: {
            message,
            status,
        },
    });
};