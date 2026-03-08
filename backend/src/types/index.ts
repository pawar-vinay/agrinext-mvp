/**
 * Core type definitions for Agrinext Backend
 */

import { Request } from 'express';

// Extend Express Request to include user data
export interface AuthRequest extends Request {
  user?: {
    id: string;
    mobileNumber: string;
    language: string;
  };
}

// User types
export interface UserProfile {
  id: string;
  name: string;
  mobileNumber: string;
  location: string;
  primaryCrop: string;
  language: 'hi' | 'en' | 'te';
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt: Date;
}

// Disease Detection types
export interface DetectionResult {
  id: string;
  diseaseName: string;
  severity: 'low' | 'medium' | 'high';
  confidenceScore: number;
  recommendations: string[];
  imageUrl: string;
  detectedAt: Date;
}

export interface DetectionDetail extends DetectionResult {
  imageMetadata: {
    size: number;
    format: string;
    dimensions: { width: number; height: number };
  };
}

// Advisory types
export interface AdvisoryResponse {
  id: string;
  query: string;
  response: string;
  language: string;
  createdAt: Date;
}

// Government Scheme types
export interface Scheme {
  id: string;
  name: string;
  description: string;
  category: 'subsidy' | 'loan' | 'insurance' | 'training';
}

export interface SchemeDetail extends Scheme {
  eligibility: string;
  benefits: string;
  applicationProcess: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    retryAfter?: number;
  };
}
