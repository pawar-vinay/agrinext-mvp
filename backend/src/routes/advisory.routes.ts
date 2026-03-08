/**
 * Advisory Routes
 * Defines routes for advisory endpoints
 */

import { Router } from 'express';
import * as advisoryController from '../controllers/advisory.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/advisories/query
 * Submit farming question and get advice
 * Requires authentication
 */
router.post(
  '/query',
  authMiddleware,
  advisoryController.submitQuery
);

/**
 * GET /api/v1/advisories/history
 * Get advisory history (paginated)
 * Requires authentication
 */
router.get(
  '/history',
  authMiddleware,
  advisoryController.getAdvisoryHistory
);

/**
 * PUT /api/v1/advisories/:id/rate
 * Rate an advisory response
 * Requires authentication
 */
router.put(
  '/:id/rate',
  authMiddleware,
  advisoryController.rateAdvisory
);

export default router;
