import prisma from '../db';

export const logEvent = (eventType: string, payload: any) => {
    return prisma.analyticsEvent.create({
        data: {
            eventType,
            payload,
        },
    });
};