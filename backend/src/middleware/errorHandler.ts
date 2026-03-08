/**
 * Centralized error handling middleware
 * Handles all errors and returns consistent error responses
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { translateError } from '../services/translation.service';

/**
 * Error handler middleware
 * Logs errors and returns user-friendly error responses
 */
export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract user info if available
  const userId = (req as any).user?.id;
  const userLanguage = (req as any).user?.language || 'en';

  // Log error with context
  logger.error({
    error: err.message,
    stack: err.stack,
    userId,
    endpoint: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Log to audit_logs table (will be implemented in audit service)
  try {
    // TODO: Implement audit logging
    // await auditLogger.logError({
    //   userId,
    //   endpoint: req.path,
    //   method: req.method,
    //   errorMessage: err.message,
    //   ipAddress: req.ip,
    // });
  } catch (auditError) {
    logger.error('Failed to log error to audit_logs:', auditError);
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    const translatedMessage = await translateError(err.message, userLanguage);
    
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: translatedMessage,
        ...(err.details && { details: err.details }),
        ...(err.retryAfter && { retryAfter: err.retryAfter }),
      },
    });
    return;
  }

  // Handle unknown errors - don't expose internals
  const genericMessage = await translateError(
    'An unexpected error occurred',
    userLanguage
  );

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: genericMessage,
    },
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
