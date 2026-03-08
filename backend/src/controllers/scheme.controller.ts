/**
 * Government Schemes Controller
 * Handles HTTP requests for government schemes endpoints
 */

import { Response, NextFunction } from 'express';
import * as schemeService from '../services/scheme.service';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

/**
 * Get all schemes or filter by category/keyword
 * GET /api/v1/schemes
 */
export const getSchemes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const language = req.user?.language || 'en';
    const category = req.query.category as string | undefined;
    const keyword = req.query.keyword as string | undefined;

    let schemes;

    if (category || keyword) {
      // Filter schemes
      schemes = await schemeService.filterSchemes(category, keyword, language);
    } else {
      // Get all schemes
      schemes = await schemeService.getAllSchemes(language);
    }

    res.status(200).json(schemes);
  } catch (error) {
    next(error);
  }
};

/**
 * Get scheme by ID
 * GET /api/v1/schemes/:id
 */
export const getSchemeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const language = req.user?.language || 'en';
    const schemeId = req.params.id;

    const scheme = await schemeService.getSchemeById(schemeId, language);

    // Log scheme view to audit_logs (TODO: implement audit service)
    logger.info('Scheme viewed', {
      userId: req.user?.id,
      schemeId,
    });

    res.status(200).json(scheme);
  } catch (error) {
    next(error);
  }
};
