import prisma from '../db';
import { HttpError } from '../middleware/error.middleware';

export const getJobStatus = async (jobId: string, userId: string) => {
    const job = await prisma.renderJob.findUnique({
        where: { id: jobId },
        include: {
            project: {
                select: {
                    userId: true,
                },
            },
        },
    });

    if (!job || job.project.userId !== userId) {
        throw new HttpError(404, 'Job not found or access denied');
    }

    const { project, ...jobDetails } = job;
    return jobDetails;
};