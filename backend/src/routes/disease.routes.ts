/**
 * Disease Detection Routes
 * Defines routes for disease detection endpoints
 */

import { Router } from 'express';
import multer from 'multer';
import * as diseaseController from '../controllers/disease.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * POST /api/v1/diseases/detect
 * Upload image and detect disease
 * Requires authentication
 */
router.post(
  '/detect',
  authMiddleware,
  upload.single('image'),
  diseaseController.detectDisease
);

/**
 * GET /api/v1/diseases/history
 * Get detection history (paginated)
 * Requires authentication
 */
router.get(
  '/history',
  authMiddleware,
  diseaseController.getDetectionHistory
);

/**
 * GET /api/v1/diseases/:id
 * Get specific detection details
 * Requires authentication
 */
router.get(
  '/:id',
  authMiddleware,
  diseaseController.getDetectionById
);

export default router;
