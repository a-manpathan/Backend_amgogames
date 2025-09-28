import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

/**
 * @swagger
 * /api/analytics/log:
 *   post:
 *     summary: Log an analytics event (public endpoint)
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       '201':
 *         description: Event logged
 */
router.post('/log', analyticsController.logEvent);

export default router;