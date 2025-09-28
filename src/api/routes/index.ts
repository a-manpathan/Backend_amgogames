import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './projects.routes';
import jobRoutes from './jobs.routes';
import analyticsRoutes from './analytics.routes';


const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/jobs', jobRoutes);
router.use('/analytics', analyticsRoutes);

export default router;