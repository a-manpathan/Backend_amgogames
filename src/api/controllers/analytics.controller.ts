import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../../services/analytics.service';

export const logEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventType, payload } = req.body;
        await analyticsService.logEvent(eventType, payload);
        res.status(201).json({ message: 'Event logged' });
    } catch (error) {
        next(error);
    }
};