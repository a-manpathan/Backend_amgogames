import { Queue } from 'bullmq';
import config from '../config';

export const renderQueue = new Queue('render-video', {
    connection: {
        host: new URL(config.REDIS_URL).hostname,
        port: Number(new URL(config.REDIS_URL).port),
    },
});