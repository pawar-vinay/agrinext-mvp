/**
 * User Controller
 * Handles HTTP requests for user profile endpoints
 */

import { Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { BadRequestError } from '../utils/errors';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

/**
 * Get user profile
 * GET /api/v1/users/profile
 */
export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    const profile = await userService.getUserProfile(userId);

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    const { name, location, primaryCrop, language } = req.body;

    // Ensure mobile number is not in the update request
    if (req.body.mobileNumber || req.body.mobile_number) {
      throw new BadRequestError(
        'IMMUTABLE_FIELD',
        'Mobile number cannot be changed'
      );
    }

    // Build updates object (only include provided fields)
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (primaryCrop !== undefined) updates.primaryCrop = primaryCrop;
    if (language !== undefined) updates.language = language;

    const updatedProfile = await userService.updateUserProfile(userId, updates);

    logger.info('User profile updated via API', {
      userId,
      updatedFields: Object.keys(updates),
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};
