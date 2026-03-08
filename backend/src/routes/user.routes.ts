/**
 * User Routes
 * Defines routes for user profile endpoints
 */

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * GET /api/v1/users/profile
 * Get current user profile
 * Requires authentication
 */
router.get(
  '/profile',
  authMiddleware,
  userController.getUserProfile
);

/**
 * PUT /api/v1/users/profile
 * Update current user profile
 * Requires authentication
 */
router.put(
  '/profile',
  authMiddleware,
  userController.updateUserProfile
);

export default router;
