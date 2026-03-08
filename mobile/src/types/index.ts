/**
 * Core Type Definitions for Agrinext Mobile App
 */

// User types
export interface User {
  id: string;
  mobileNumber: string;
  name: string;
  location: string;
  primaryCrop: string;
  language: 'en' | 'hi' | 'te';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Disease Detection types
export interface DetectionResult {
  id: string;
  userId: string;
  diseaseName: string;
  severity: 'low' | 'medium' | 'high';
  confidenceScore: number;
  recommendations: string;
  imageUrl: string;
  imageMetadata: {
    size: number;
    format: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
  createdAt: string;
}

export interface DetectionHistory {
  detections: DetectionResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Advisory types
export interface Advisory {
  id: string;
  userId: string;
  query: string;
  response: string;
  rating?: number;
  createdAt: string;
}

export interface AdvisoryHistory {
  advisories: Advisory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Government Scheme types
export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  category: 'subsidy' | 'loan' | 'insurance' | 'training';
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  OTPVerification: { mobileNumber: string };
  Registration: { mobileNumber: string; tokens: AuthTokens };
  MainTabs: undefined;
  DetectionResult: { detectionId: string };
  DetectionDetail: { detectionId: string };
  AdvisoryChat: { advisoryId: string };
  SchemeDetail: { schemeId: string };
  ProfileEdit: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Detection: undefined;
  Advisory: undefined;
  Schemes: undefined;
  Profile: undefined;
};
