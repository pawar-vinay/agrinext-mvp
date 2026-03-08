/**
 * Rate limiting middleware
 * Implements rate limiting for API endpoints and OTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { env } from '../config/env';
import { RateLimitError, OTPRateLimitError } from '../utils/errors';
import logger from '../utils/logger';

interface RateLimitRecord {
  identifier: string;
  request_count: number;
  window_start: Date;
}

/**
 * OTP rate limiter
 * Limits OTP requests to 3 per hour per mobile number
 */
export const otpRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return next();
    }

    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = 3;
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Get rate limit record
    const result = await query<RateLimitRecord>(
      `SELECT COUNT(*) as request_count, MIN(created_at) as window_start
       FROM otp_rate_limits
       WHERE mobile_number = $1 AND created_at > $2`,
      [mobileNumber, windowStart]
    );

    const requestCount = parseInt(String(result.rows[0]?.request_count) || '0', 10);

    if (requestCount >= maxRequests) {
      // Calculate retry after time
      const oldestRequest = result.rows[0]?.window_start;
      if (oldestRequest) {
        const retryAfter = Math.ceil(
          (new Date(oldestRequest).getTime() + windowMs - now.getTime()) / 1000
        );

        logger.warn(`OTP rate limit exceeded for ${mobileNumber}`, {
          requestCount,
          retryAfter,
        });

        throw new OTPRateLimitError(retryAfter);
      }
    }

    // Record this request
    await query(
      `INSERT INTO otp_rate_limits (mobile_number, created_at)
       VALUES ($1, NOW())`,
      [mobileNumber]
    );

    // Clean up old records (older than 1 hour)
    await query(
      `DELETE FROM otp_rate_limits 
       WHERE created_at < $1`,
      [windowStart]
    );

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * General API rate limiter
 * Limits API requests to configured limit per window per user
 */
export const apiRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from auth middleware or use IP address
    const identifier =
      (req as any).user?.id || req.ip || 'anonymous';

    const windowMs = env.RATE_LIMIT_WINDOW_MS;
    const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Get rate limit record
    const result = await query<RateLimitRecord>(
      `SELECT COUNT(*) as request_count
       FROM api_rate_limits
       WHERE identifier = $1 AND created_at > $2`,
      [identifier, windowStart]
    );

    const requestCount = parseInt(String(result.rows[0]?.request_count) || '0', 10);

    if (requestCount >= maxRequests) {
      const retryAfter = Math.ceil(windowMs / 1000);

      logger.warn(`API rate limit exceeded for ${identifier}`, {
        requestCount,
        endpoint: req.path,
      });

      throw new RateLimitError(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        retryAfter
      );
    }

    // Record this request
    await query(
      `INSERT INTO api_rate_limits (identifier, endpoint, created_at)
       VALUES ($1, $2, NOW())`,
      [identifier, req.path]
    );

    // Clean up old records
    await query(
      `DELETE FROM api_rate_limits 
       WHERE created_at < $1`,
      [windowStart]
    );

    next();
  } catch (error) {
    next(error);
  }
};
