/**
 * Authentication Routes
 * Defines routes for authentication endpoints
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/auth/send-otp
 * Send OTP to mobile number
 * Rate limited: 3 requests per hour per mobile number
 */
router.post('/send-otp', otpRateLimiter, authController.sendOTP);

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP and login
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * POST /api/v1/auth/register
 * Register new user
 */
router.post('/register', authController.register);

/**
 * POST /api/v1/auth/refresh-token
 * Refresh access token
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * POST /api/v1/auth/logout
 * Logout user (requires authentication)
 */
router.post('/logout', authMiddleware, authController.logout);

export default router;
