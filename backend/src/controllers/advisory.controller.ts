/**
 * Advisory Controller
 * Handles HTTP requests for advisory endpoints
 */

import { Response, NextFunction } from 'express';
import * as advisoryService from '../services/advisory.service';
import { BadRequestError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

/**
 * Submit advisory query
 * POST /api/v1/advisories/query
 */
export const submitQuery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const language = req.user?.language || 'en';
    const { query } = req.body;

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    if (!query) {
      throw new BadRequestError(
        'MISSING_QUERY',
        'Query text is required'
      );
    }

    // Validate query length
    if (query.length > 500) {
      throw new BadRequestError(
        'QUERY_TOO_LONG',
        'Query must be less than 500 characters'
      );
    }

    if (query.trim().length === 0) {
      throw new BadRequestError(
        'EMPTY_QUERY',
        'Query cannot be empty'
      );
    }

    const result = await advisoryService.generateAdvisory(
      query,
      userId,
      language
    );

    // Log to audit_logs (TODO: implement audit service)
    logger.info('Advisory generated', {
      userId,
      advisoryId: result.id,
      queryLength: query.length,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get advisory history
 * GET /api/v1/advisories/history
 */
export const getAdvisoryHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestError(
        'INVALID_PAGINATION',
        'Page must be >= 1 and limit must be between 1 and 100'
      );
    }

    const result = await advisoryService.getAdvisoryHistory(
      userId,
      page,
      limit
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Rate an advisory
 * PUT /api/v1/advisories/:id/rate
 */
export const rateAdvisory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const advisoryId = req.params.id;
    const { rating } = req.body;

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    if (!advisoryId) {
      throw new BadRequestError(
        'MISSING_ADVISORY_ID',
        'Advisory ID is required'
      );
    }

    if (rating === undefined || rating === null) {
      throw new BadRequestError(
        'MISSING_RATING',
        'Rating is required'
      );
    }

    // Validate rating value
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new BadRequestError(
        'INVALID_RATING',
        'Rating must be a number between 1 and 5'
      );
    }

    try {
      await advisoryService.rateAdvisory(advisoryId, userId, rating);

      res.status(200).json({
        success: true,
        message: 'Advisory rated successfully',
      });
    } catch (error) {
      if ((error as Error).message === 'Advisory not found or access denied') {
        throw new ForbiddenError(
          'FORBIDDEN',
          'You do not have permission to rate this advisory'
        );
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
