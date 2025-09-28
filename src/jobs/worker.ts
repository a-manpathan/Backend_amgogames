import { Worker } from 'bullmq';
import { exec } from 'child_process';
import util from 'util';
import prisma from '../db';
import config from '../config';

const execPromise = util.promisify(exec);

const worker = new Worker('render-video', async job => {
    const { projectId, jobId } = job.data;
    console.log(`Processing job ${job.id} for project ${projectId}`);

    try {
        // 1. Update status to 'processing'
        await prisma.renderJob.update({
            where: { id: jobId },
            data: { status: 'processing', progress: 10 },
        });

        // 2. Simulate a long-running render process (e.g., using FFmpeg)
        // This is a placeholder. In a real scenario, you would build a
        // complex ffmpeg command based on project assets.
        console.log('Simulating FFmpeg render...');
        // We'll use a simple `sleep` command to simulate the delay.
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15-second "render"
        
        // Let's pretend this command ran successfully.
        // const { stdout, stderr } = await execPromise('ffmpeg -i ...');

        await prisma.renderJob.update({
            where: { id: jobId },
            data: { progress: 50 },
        });
        await new Promise(resolve => setTimeout(resolve, 15000)); // Another 15 seconds
        console.log('Simulation complete.');


        // 3. Update status to 'completed' and set output URL
        const outputUrl = `/renders/${projectId}.mp4`; // Dummy URL
        await prisma.renderJob.update({
            where: { id: jobId },
            data: { status: 'completed', progress: 100, outputUrl },
        });

        console.log(`Job ${job.id} completed successfully.`);

    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        // 4. Update status to 'failed' on error
        await prisma.renderJob.update({
            where: { id: jobId },
            data: { status: 'failed' },
        });
        throw error; // Re-throw to let BullMQ know the job failed
    }
}, {
    connection: {
        host: new URL(config.REDIS_URL).hostname,
        port: Number(new URL(config.REDIS_URL).port),
    }
});

console.log('Worker is listening for jobs...');

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
});
