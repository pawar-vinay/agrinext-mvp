/**
 * Authentication Service
 * Handles user authentication, token generation, and session management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database';
import { env } from '../config/env';
import logger from '../utils/logger';
import {
  InvalidTokenError,
  UnauthorizedError,
  BadRequestError,
} from '../utils/errors';
import { generateOTP, storeOTP, verifyOTP } from './otp.service';
import { sendOTPSMS } from './sms.service';
import { TokenPair, UserProfile, OTPResponse } from '../types';

interface User {
  id: string;
  name: string;
  mobile_number: string;
  location: string;
  primary_crop: string;
  language: string;
  created_at: Date;
  updated_at: Date;
}

interface JWTPayload {
  userId: string;
  mobileNumber: string;
  language: string;
}

/**
 * Send OTP to mobile number
 * @param mobileNumber User's mobile number
 * @returns OTP response with expiration time
 */
export const sendOTP = async (mobileNumber: string): Promise<OTPResponse> => {
  // Generate OTP
  const otpCode = generateOTP();

  // Store OTP in database
  const expiresAt = await storeOTP(mobileNumber, otpCode);

  // Send OTP via SMS
  await sendOTPSMS(mobileNumber, otpCode);

  logger.info(`OTP sent to ${mobileNumber}`);

  return {
    success: true,
    message: 'OTP sent successfully',
    expiresAt,
  };
};

/**
 * Generate JWT access token
 * @param payload Token payload
 * @returns JWT access token
 */
const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token
 * @param payload Token payload
 * @returns JWT refresh token
 */
const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Hash refresh token for storage
 * @param token Refresh token
 * @returns Hashed token
 */
const hashToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, 10);
};

/**
 * Store user session in database
 * @param userId User ID
 * @param refreshToken Refresh token
 */
const storeSession = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  const tokenHash = await hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  );

  await query(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
};

/**
 * Verify OTP and issue tokens
 * @param mobileNumber User's mobile number
 * @param otpCode OTP code
 * @returns Token pair and user info
 */
export const verifyOTPAndLogin = async (
  mobileNumber: string,
  otpCode: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user?: UserProfile;
}> => {
  // Verify OTP
  await verifyOTP(mobileNumber, otpCode);

  // Check if user exists
  const result = await query<User>(
    'SELECT * FROM users WHERE mobile_number = $1',
    [mobileNumber]
  );

  const isNewUser = result.rows.length === 0;

  if (isNewUser) {
    // New user - return tokens without user profile
    // User will need to complete registration
    const tempPayload: JWTPayload = {
      userId: 'temp',
      mobileNumber,
      language: 'en',
    };

    const accessToken = generateAccessToken(tempPayload);
    const refreshToken = generateRefreshToken(tempPayload);

    return {
      accessToken,
      refreshToken,
      isNewUser: true,
    };
  }

  // Existing user - return tokens with user profile
  const user = result.rows[0];
  const payload: JWTPayload = {
    userId: user.id,
    mobileNumber: user.mobile_number,
    language: user.language,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store session
  await storeSession(user.id, refreshToken);

  // Update last login
  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  logger.info(`User logged in: ${user.id}`);

  return {
    accessToken,
    refreshToken,
    isNewUser: false,
    user: {
      id: user.id,
      name: user.name,
      mobileNumber: user.mobile_number,
      location: user.location,
      primaryCrop: user.primary_crop,
      language: user.language as 'hi' | 'en' | 'te',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  };
};

/**
 * Register new user
 * @param userData User profile data
 * @param mobileNumber User's mobile number
 * @returns User profile and tokens
 */
export const registerUser = async (
  userData: {
    name: string;
    location: string;
    primaryCrop: string;
    language: 'hi' | 'en' | 'te';
  },
  mobileNumber: string
): Promise<{
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}> => {
  // Validate required fields
  if (!userData.name || !userData.location || !userData.primaryCrop || !userData.language) {
    throw new BadRequestError(
      'MISSING_REQUIRED_FIELDS',
      'Name, location, primary crop, and language are required',
      {
        missingFields: [
          !userData.name && 'name',
          !userData.location && 'location',
          !userData.primaryCrop && 'primaryCrop',
          !userData.language && 'language',
        ].filter(Boolean),
      }
    );
  }

  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE mobile_number = $1',
    [mobileNumber]
  );

  if (existingUser.rows.length > 0) {
    throw new BadRequestError(
      'USER_ALREADY_EXISTS',
      'User with this mobile number already exists'
    );
  }

  // Create user
  const userId = uuidv4();
  const result = await query<User>(
    `INSERT INTO users (id, name, mobile_number, location, primary_crop, language)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      userData.name,
      mobileNumber,
      userData.location,
      userData.primaryCrop,
      userData.language,
    ]
  );

  const user = result.rows[0];

  // Generate tokens
  const payload: JWTPayload = {
    userId: user.id,
    mobileNumber: user.mobile_number,
    language: user.language,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store session
  await storeSession(user.id, refreshToken);

  logger.info(`New user registered: ${user.id}`);

  return {
    user: {
      id: user.id,
      name: user.name,
      mobileNumber: user.mobile_number,
      location: user.location,
      primaryCrop: user.primary_crop,
      language: user.language as 'hi' | 'en' | 'te',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 * @param refreshToken Refresh token
 * @returns New access token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      env.REFRESH_TOKEN_SECRET
    ) as JWTPayload;

    // Check if session exists
    const sessions = await query(
      `SELECT * FROM user_sessions 
       WHERE user_id = $1 AND expires_at > NOW()`,
      [decoded.userId]
    );

    if (sessions.rows.length === 0) {
      throw new InvalidTokenError('Session not found or expired');
    }

    // Verify token hash matches one of the stored sessions
    let validSession = false;
    for (const session of sessions.rows) {
      const isValid = await bcrypt.compare(refreshToken, session.token_hash);
      if (isValid) {
        validSession = true;
        break;
      }
    }

    if (!validSession) {
      throw new InvalidTokenError('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      mobileNumber: decoded.mobileNumber,
      language: decoded.language,
    });

    return { accessToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError('Invalid refresh token');
    }
    throw error;
  }
};

/**
 * Logout user
 * @param userId User ID
 * @param refreshToken Refresh token to invalidate
 */
export const logout = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  // Find and delete the session
  const sessions = await query(
    'SELECT * FROM user_sessions WHERE user_id = $1',
    [userId]
  );

  for (const session of sessions.rows) {
    const isValid = await bcrypt.compare(refreshToken, session.token_hash);
    if (isValid) {
      await query('DELETE FROM user_sessions WHERE id = $1', [session.id]);
      logger.info(`User logged out: ${userId}`);
      return;
    }
  }
};

/**
 * Validate JWT token
 * @param token JWT token
 * @returns Decoded payload
 */
export const validateToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new InvalidTokenError('Invalid or expired token');
  }
};
