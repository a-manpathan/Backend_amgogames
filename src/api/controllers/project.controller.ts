import { Response, NextFunction } from 'express';
import * as projectService from '../../services/project.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        const userId = req.user!.userId;
        const project = await projectService.createProject(name, userId);
        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

export const addAssetToProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const userId = req.user!.userId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const asset = await projectService.addAsset(projectId, userId, file);
        res.status(201).json(asset);
    } catch (error) {
        next(error);
    }
};

export const startRenderJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const userId = req.user!.userId;
        const job = await projectService.queueRenderJob(projectId, userId);
        res.status(202).json({ message: 'Render job accepted', jobId: job.id });
    } catch (error) {
        next(error);
    }
};