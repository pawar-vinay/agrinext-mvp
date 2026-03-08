/**
 * Environment configuration
 * Validates and exports environment variables
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
// Use process.cwd() instead of __dirname for reliable path resolution with tsx
dotenv.config({ path: path.join(process.cwd(), '.env') });

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;
  API_VERSION: string;

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_SSL: boolean;
  DB_POOL_MIN: number;
  DB_POOL_MAX: number;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;

  // Twilio
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;

  // AWS S3
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET: string;

  // OpenAI
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_MAX_TOKENS: number;

  // Hugging Face
  HUGGINGFACE_API_KEY: string;
  HUGGINGFACE_MODEL: string;

  // Roboflow
  ROBOFLOW_API_KEY: string;
  ROBOFLOW_PROJECT: string;
  ROBOFLOW_VERSION: string;

  // Google Translate
  GOOGLE_PROJECT_ID: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // OTP
  OTP_EXPIRY_MINUTES: number;
  OTP_MAX_ATTEMPTS: number;

  // Logging
  LOG_LEVEL: string;

  // CORS
  CORS_ORIGIN: string;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const env: EnvConfig = {
  // Server
  PORT: getEnvNumber('PORT', 3000),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  API_VERSION: getEnv('API_VERSION', 'v1'),

  // Database
  DB_HOST: getEnv('DB_HOST'),
  DB_PORT: getEnvNumber('DB_PORT', 5432),
  DB_NAME: getEnv('DB_NAME'),
  DB_USER: getEnv('DB_USER'),
  DB_PASSWORD: getEnv('DB_PASSWORD'),
  DB_SSL: getEnvBoolean('DB_SSL', false),
  DB_POOL_MIN: getEnvNumber('DB_POOL_MIN', 10),
  DB_POOL_MAX: getEnvNumber('DB_POOL_MAX', 50),

  // JWT
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '1h'),
  REFRESH_TOKEN_SECRET: getEnv('REFRESH_TOKEN_SECRET'),
  REFRESH_TOKEN_EXPIRES_IN: getEnv('REFRESH_TOKEN_EXPIRES_IN', '30d'),

  // Twilio
  TWILIO_ACCOUNT_SID: getEnv('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: getEnv('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: getEnv('TWILIO_PHONE_NUMBER'),

  // AWS S3
  AWS_ACCESS_KEY_ID: getEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: getEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: getEnv('AWS_REGION', 'us-east-1'),
  AWS_S3_BUCKET: getEnv('AWS_S3_BUCKET'),

  // OpenAI
  OPENAI_API_KEY: getEnv('OPENAI_API_KEY'),
  OPENAI_MODEL: getEnv('OPENAI_MODEL', 'gpt-3.5-turbo'),
  OPENAI_MAX_TOKENS: getEnvNumber('OPENAI_MAX_TOKENS', 500),

  // Hugging Face
  HUGGINGFACE_API_KEY: getEnv('HUGGINGFACE_API_KEY'),
  HUGGINGFACE_MODEL: getEnv('HUGGINGFACE_MODEL'),

  // Roboflow
  ROBOFLOW_API_KEY: getEnv('ROBOFLOW_API_KEY', 'demo'),
  ROBOFLOW_PROJECT: getEnv('ROBOFLOW_PROJECT', 'plant-disease-detection'),
  ROBOFLOW_VERSION: getEnv('ROBOFLOW_VERSION', '1'),

  // Google Translate
  GOOGLE_PROJECT_ID: getEnv('GOOGLE_PROJECT_ID'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),

  // OTP
  OTP_EXPIRY_MINUTES: getEnvNumber('OTP_EXPIRY_MINUTES', 10),
  OTP_MAX_ATTEMPTS: getEnvNumber('OTP_MAX_ATTEMPTS', 3),

  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),

  // CORS
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
};

export default env;
