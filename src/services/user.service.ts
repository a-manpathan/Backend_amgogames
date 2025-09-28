import prisma from '../db';
import { User } from '@prisma/client';

export const createUser = (email: string, password: string): Promise<User> => {
    return prisma.user.create({
        data: {
            email,
            password,
        },
    });
};

export const findUserByEmail = (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { email },
    });
};

export const findUserById = (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { id },
    });
};