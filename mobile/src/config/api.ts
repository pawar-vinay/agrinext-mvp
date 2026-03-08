/**
 * API Configuration
 */

export const API_CONFIG = {
  BASE_URL: 'http://3.239.184.220:3000',
  API_VERSION: 'v1',
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    DETECTION: 30000, // 30 seconds for disease detection
    ADVISORY: 10000, // 10 seconds for advisory
  },
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  // Disease Detection
  DISEASES: {
    DETECT: '/diseases/detect',
    HISTORY: '/diseases/history',
    DETAIL: (id: string) => `/diseases/${id}`,
  },
  // Advisory
  ADVISORIES: {
    QUERY: '/advisories/query',
    HISTORY: '/advisories/history',
    RATE: (id: string) => `/advisories/${id}/rate`,
  },
  // User Profile
  USERS: {
    PROFILE: '/users/profile',
  },
  // Government Schemes
  SCHEMES: {
    LIST: '/schemes',
    DETAIL: (id: string) => `/schemes/${id}`,
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
};
