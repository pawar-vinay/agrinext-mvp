/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { BadRequestError } from '../utils/errors';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

/**
 * Send OTP to mobile number
 * POST /api/v1/auth/send-otp
 */
export const sendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mobileNumber } = req.body;

    // Validate mobile number
    if (!mobileNumber) {
      throw new BadRequestError(
        'MISSING_MOBILE_NUMBER',
        'Mobile number is required'
      );
    }

    // Validate mobile number format (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      throw new BadRequestError(
        'INVALID_MOBILE_NUMBER',
        'Mobile number must be exactly 10 digits'
      );
    }

    const result = await authService.sendOTP(mobileNumber);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and login
 * POST /api/v1/auth/verify-otp
 */
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mobileNumber, code } = req.body;

    // Validate inputs
    if (!mobileNumber || !code) {
      throw new BadRequestError(
        'MISSING_REQUIRED_FIELDS',
        'Mobile number and OTP code are required'
      );
    }

    const result = await authService.verifyOTPAndLogin(mobileNumber, code);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, location, primaryCrop, language, mobileNumber } = req.body;

    // Validate required fields
    if (!name || !location || !primaryCrop || !language || !mobileNumber) {
      throw new BadRequestError(
        'MISSING_REQUIRED_FIELDS',
        'Name, location, primary crop, language, and mobile number are required',
        {
          missingFields: [
            !name && 'name',
            !location && 'location',
            !primaryCrop && 'primaryCrop',
            !language && 'language',
            !mobileNumber && 'mobileNumber',
          ].filter(Boolean),
        }
      );
    }

    // Validate language
    const validLanguages = ['hi', 'en', 'te'];
    if (!validLanguages.includes(language)) {
      throw new BadRequestError(
        'INVALID_LANGUAGE',
        'Language must be one of: hi, en, te'
      );
    }

    const result = await authService.registerUser(
      { name, location, primaryCrop, language },
      mobileNumber
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh-token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError(
        'MISSING_REFRESH_TOKEN',
        'Refresh token is required'
      );
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('UNAUTHORIZED', 'User not authenticated');
    }

    if (!refreshToken) {
      throw new BadRequestError(
        'MISSING_REFRESH_TOKEN',
        'Refresh token is required'
      );
    }

    await authService.logout(userId, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
