/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 */

import { query } from '../config/database';
import { env } from '../config/env';
import logger from '../utils/logger';
import { InvalidOTPError } from '../utils/errors';
import crypto from 'crypto';

interface OTPRecord {
  mobile_number: string;
  otp_code: string;
  expires_at: Date;
  attempts: number;
  created_at: Date;
}

/**
 * Generate a 6-digit OTP code
 * @returns 6-digit OTP code
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP in database
 * @param mobileNumber User's mobile number
 * @param otpCode Generated OTP code
 * @returns Expiration timestamp
 */
export const storeOTP = async (
  mobileNumber: string,
  otpCode: string
): Promise<Date> => {
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  // Delete any existing OTP for this mobile number
  await query('DELETE FROM otp_verifications WHERE mobile_number = $1', [
    mobileNumber,
  ]);

  // Insert new OTP
  await query(
    `INSERT INTO otp_verifications (mobile_number, otp_code, expires_at, attempts)
     VALUES ($1, $2, $3, 0)`,
    [mobileNumber, otpCode, expiresAt]
  );

  logger.info(`OTP stored for mobile number: ${mobileNumber}`);
  return expiresAt;
};

/**
 * Verify OTP code
 * @param mobileNumber User's mobile number
 * @param otpCode OTP code to verify
 * @returns True if OTP is valid
 * @throws InvalidOTPError if OTP is invalid or expired
 */
export const verifyOTP = async (
  mobileNumber: string,
  otpCode: string
): Promise<boolean> => {
  // Get OTP record
  const result = await query<OTPRecord>(
    `SELECT * FROM otp_verifications 
     WHERE mobile_number = $1`,
    [mobileNumber]
  );

  if (result.rows.length === 0) {
    throw new InvalidOTPError('No OTP found for this mobile number');
  }

  const otpRecord = result.rows[0];

  // Check if OTP has expired
  if (new Date() > new Date(otpRecord.expires_at)) {
    await query('DELETE FROM otp_verifications WHERE mobile_number = $1', [
      mobileNumber,
    ]);
    throw new InvalidOTPError('OTP has expired');
  }

  // Check if max attempts exceeded
  if (otpRecord.attempts >= env.OTP_MAX_ATTEMPTS) {
    await query('DELETE FROM otp_verifications WHERE mobile_number = $1', [
      mobileNumber,
    ]);
    throw new InvalidOTPError('Maximum OTP attempts exceeded');
  }

  // Verify OTP code
  if (otpRecord.otp_code !== otpCode) {
    // Increment attempts
    await query(
      `UPDATE otp_verifications 
       SET attempts = attempts + 1 
       WHERE mobile_number = $1`,
      [mobileNumber]
    );
    throw new InvalidOTPError('Invalid OTP code');
  }

  // OTP is valid - delete it
  await query('DELETE FROM otp_verifications WHERE mobile_number = $1', [
    mobileNumber,
  ]);

  logger.info(`OTP verified successfully for mobile number: ${mobileNumber}`);
  return true;
};

/**
 * Clean up expired OTPs (should be run periodically)
 */
export const cleanupExpiredOTPs = async (): Promise<void> => {
  const result = await query(
    'DELETE FROM otp_verifications WHERE expires_at < NOW()'
  );
  logger.info(`Cleaned up ${result.rowCount} expired OTPs`);
};
