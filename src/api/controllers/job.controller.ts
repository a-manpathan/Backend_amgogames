import { Response, NextFunction } from 'express';
import * as jobService from '../../services/job.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const getJobStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { jobId } = req.params;
        const userId = req.user!.userId;
        const jobStatus = await jobService.getJobStatus(jobId, userId);
        res.status(200).json(jobStatus);
    } catch (error) {
        next(error);
    }
};