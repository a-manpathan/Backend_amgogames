import { Router } from 'express';
import multer from 'multer';
import * as projectController from '../controllers/project.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Project created successfully
 *       '401':
 *         description: Unauthorized
 */
router.post('/', authMiddleware, projectController.createProject);

/**
 * @swagger
 * /api/projects/{projectId}/assets:
 *   post:
 *     summary: Upload an asset to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               asset:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Asset uploaded successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Project not found
 */
router.post(
    '/:projectId/assets',
    authMiddleware,
    upload.single('asset'),
    projectController.addAssetToProject
);

/**
 * @swagger
 * /api/projects/{projectId}/render:
 *   post:
 *     summary: Start a new render job for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '202':
 *         description: Render job accepted and queued
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Project not found
 */
router.post('/:projectId/render', authMiddleware, projectController.startRenderJob);

export default router;