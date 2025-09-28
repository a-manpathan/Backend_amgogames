import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { HttpError } from './error.middleware';

// Extend the Express Request type to include our custom property
export interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new HttpError(401, 'Authentication token required'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        return next(new HttpError(401, 'Invalid or expired token'));
    }
};