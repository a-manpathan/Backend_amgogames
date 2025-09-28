import prisma from '../db';
import { HttpError } from '../middleware/error.middleware';
import { renderQueue } from '../jobs/queue';

export const createProject = (name: string, userId: string) => {
    return prisma.project.create({
        data: { name, userId },
    });
};

export const addAsset = async (projectId: string, userId: string, file: Express.Multer.File) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
        throw new HttpError(404, 'Project not found or access denied');
    }

    // In a real app, you'd upload the file to S3 or another storage service
    // and store the final URL. Here we'll just store the local path.
    const assetUrl = file.path;

    return prisma.asset.create({
        data: {
            type: file.mimetype,
            url: assetUrl,
            projectId: projectId,
        },
    });
};

export const queueRenderJob = async (projectId: string, userId: string) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
        throw new HttpError(404, 'Project not found or access denied');
    }

    // Create the job record in the database
    const renderJob = await prisma.renderJob.create({
        data: {
            projectId: projectId,
            status: 'queued',
        },
    });

    // Add the job to the BullMQ queue
    await renderQueue.add('render-video', { projectId, jobId: renderJob.id });

    return renderJob;
};