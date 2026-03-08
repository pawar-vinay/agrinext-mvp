/**
 * Disease Detection Controller
 * Handles HTTP requests for disease detection endpoints
 */

import { Response, NextFunction } from 'express';
import * as diseaseService from '../services/disease.service';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

/**
 * Detect disease from uploaded image
 * POST /api/v1/diseases/detect
 */
export const detectDisease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const language = req.user?.language || 'en';

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new BadRequestError(
        'MISSING_IMAGE',
        'Image file is required'
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      throw new BadRequestError(
        'FILE_TOO_LARGE',
        'Image file must be less than 10MB'
      );
    }

    // Detect disease
    const result = await diseaseService.detectDisease(
      req.file.buffer,
      userId,
      language
    );

    // Log to audit_logs (TODO: implement audit service)
    logger.info('Disease detection completed', {
      userId,
      detectionId: result.id,
      diseaseName: result.diseaseName,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get detection history
 * GET /api/v1/diseases/history
 */
export const getDetectionHistory = async (
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

    const result = await diseaseService.getDetectionHistory(
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
 * Get detection by ID
 * GET /api/v1/diseases/:id
 */
export const getDetectionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const detectionId = req.params.id;

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    if (!detectionId) {
      throw new BadRequestError(
        'MISSING_DETECTION_ID',
        'Detection ID is required'
      );
    }

    try {
      const result = await diseaseService.getDetectionById(
        detectionId,
        userId
      );

      res.status(200).json(result);
    } catch (error) {
      if ((error as Error).message === 'Detection not found') {
        throw new ForbiddenError(
          'FORBIDDEN',
          'You do not have permission to access this detection'
        );
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
