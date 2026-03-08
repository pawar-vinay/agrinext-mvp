/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

/**
 * Authentication middleware
 * Validates JWT token from Authorization header
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(
        'MISSING_TOKEN',
        'Authorization token is required'
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // DEMO MODE: Accept mock tokens for prototype
    if (token.startsWith('demo-token-')) {
      // Extract timestamp from token
      const timestamp = token.replace('demo-token-', '');
      
      // Create a demo user for the request
      (req as AuthRequest).user = {
        id: `demo-user-${timestamp}`,
        mobileNumber: '9876543210',
        language: 'en',
      };
      
      next();
      return;
    }

    // Validate real JWT token
    const decoded = validateToken(token);

    // Attach user info to request
    (req as AuthRequest).user = {
      id: decoded.userId,
      mobileNumber: decoded.mobileNumber,
      language: decoded.language,
    };

    next();
  } catch (error) {
    // Log authentication failure
    logger.warn('Authentication failed:', {
      ip: req.ip,
      endpoint: req.path,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // TODO: Log to audit_logs table
    // await auditLogger.logAuthFailure({
    //   endpoint: req.path,
    //   method: req.method,
    //   ipAddress: req.ip,
    //   errorMessage: error.message,
    // });

    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = validateToken(token);

      (req as AuthRequest).user = {
        id: decoded.userId,
        mobileNumber: decoded.mobileNumber,
        language: decoded.language,
      };
    }

    next();
  } catch (error) {
    // Ignore token validation errors for optional auth
    next();
  }
};
