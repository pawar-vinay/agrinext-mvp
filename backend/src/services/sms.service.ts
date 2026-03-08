/**
 * SMS Service
 * Handles SMS sending via Twilio with retry logic
 */

import twilio from 'twilio';
import { env } from '../config/env';
import logger from '../utils/logger';
import { ExternalServiceError } from '../utils/errors';

// Check if Twilio is configured
const isTwilioConfigured = 
  env.TWILIO_ACCOUNT_SID && 
  env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
  env.TWILIO_AUTH_TOKEN &&
  env.TWILIO_AUTH_TOKEN.length > 10;

// Initialize Twilio client only if configured
const twilioClient = isTwilioConfigured 
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Sleep utility for retry delays
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Send OTP via SMS with retry logic
 * @param mobileNumber Recipient mobile number (with country code)
 * @param otpCode OTP code to send
 * @throws ExternalServiceError if SMS sending fails after retries
 */
export const sendOTPSMS = async (
  mobileNumber: string,
  otpCode: string
): Promise<void> => {
  // Demo mode: Just log the OTP
  if (!isTwilioConfigured || !twilioClient) {
    logger.info(`[DEMO MODE] OTP for ${mobileNumber}: ${otpCode}`);
    console.log(`\n🔐 DEMO MODE - OTP Code: ${otpCode} for ${mobileNumber}\n`);
    return;
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  // Ensure mobile number has country code
  const formattedNumber = mobileNumber.startsWith('+')
    ? mobileNumber
    : `+91${mobileNumber}`; // Default to India country code

  const message = `Your Agrinext OTP is: ${otpCode}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Sending OTP SMS (attempt ${attempt}/${maxRetries}) to ${formattedNumber}`);

      const result = await twilioClient.messages.create({
        body: message,
        to: formattedNumber,
        from: env.TWILIO_PHONE_NUMBER,
      });

      logger.info(`OTP SMS sent successfully. SID: ${result.sid}`);
      return;
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Twilio attempt ${attempt} failed:`, {
        error: lastError.message,
        mobileNumber: formattedNumber,
      });

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  logger.error('Failed to send OTP SMS after all retries:', {
    error: lastError?.message,
    mobileNumber: formattedNumber,
  });

  throw new ExternalServiceError(
    'Twilio',
    'Unable to send OTP. Please try again later.'
  );
};

/**
 * Send a generic SMS message
 * @param mobileNumber Recipient mobile number
 * @param message Message content
 */
export const sendSMS = async (
  mobileNumber: string,
  message: string
): Promise<void> => {
  // Demo mode: Just log the message
  if (!isTwilioConfigured || !twilioClient) {
    logger.info(`[DEMO MODE] SMS to ${mobileNumber}: ${message}`);
    return;
  }

  const formattedNumber = mobileNumber.startsWith('+')
    ? mobileNumber
    : `+91${mobileNumber}`;

  try {
    const result = await twilioClient.messages.create({
      body: message,
      to: formattedNumber,
      from: env.TWILIO_PHONE_NUMBER,
    });

    logger.info(`SMS sent successfully. SID: ${result.sid}`);
  } catch (error) {
    logger.error('Failed to send SMS:', error);
    throw new ExternalServiceError('Twilio', 'Unable to send SMS');
  }
};
