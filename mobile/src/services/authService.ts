/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { User, AuthTokens, AuthResponse, ApiResponse } from '../types';

export interface SendOTPResponse {
  message: string;
  expiresAt: string;
}

export interface VerifyOTPResponse {
  isNewUser: boolean;
  tokens: AuthTokens;
  user?: User;
}

export interface RegisterUserData {
  name: string;
  location: string;
  primaryCrop: string;
  language: 'en' | 'hi' | 'te';
}

/**
 * Send OTP to mobile number
 */
export const sendOTP = async (mobileNumber: string): Promise<ApiResponse<SendOTPResponse>> => {
  return apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { mobileNumber });
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (
  mobileNumber: string,
  otp: string
): Promise<ApiResponse<VerifyOTPResponse>> => {
  return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { mobileNumber, otp });
};

/**
 * Register new user
 */
export const registerUser = async (
  mobileNumber: string,
  userData: RegisterUserData
): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
    mobileNumber,
    ...userData,
  });
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
  return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
};

/**
 * Logout user
 */
export const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
};
