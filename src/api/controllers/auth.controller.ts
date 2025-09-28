import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await authService.registerUser(email, password);
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const token = await authService.loginUser(email, password);
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};