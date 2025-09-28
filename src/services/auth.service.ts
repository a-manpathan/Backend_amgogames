import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userService from './user.service';
import config from '../config';
import { HttpError } from '../middleware/error.middleware';

export const registerUser = async (email: string, password: string) => {
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
        throw new HttpError(409, 'User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return userService.createUser(email, hashedPassword);
};

export const loginUser = async (email: string, password: string) => {
    const user = await userService.findUserByEmail(email);
    if (!user) {
        throw new HttpError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new HttpError(401, 'Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, {
        expiresIn: '1h',
    });

    return token;
};