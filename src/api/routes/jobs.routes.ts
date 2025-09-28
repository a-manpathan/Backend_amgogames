import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/jobs/{jobId}/status:
 *   get:
 *     summary: Get the status of a render job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Job status retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Job not found
 */
router.get('/:jobId/status', authMiddleware, jobController.getJobStatus);

export default router;