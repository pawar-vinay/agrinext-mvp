/**
 * Government Schemes Routes
 * Defines routes for government schemes endpoints
 */

import { Router } from 'express';
import * as schemeController from '../controllers/scheme.controller';
import { optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

/**
 * GET /api/v1/schemes
 * Get all schemes or filter by category/keyword
 * Optional authentication (for language preference)
 * Query params:
 *   - category: Filter by category (subsidy, loan, insurance, training)
 *   - keyword: Search keyword
 */
router.get(
  '/',
  optionalAuthMiddleware,
  schemeController.getSchemes
);

/**
 * GET /api/v1/schemes/:id
 * Get specific scheme details
 * Optional authentication (for language preference)
 */
router.get(
  '/:id',
  optionalAuthMiddleware,
  schemeController.getSchemeById
);

export default router;
