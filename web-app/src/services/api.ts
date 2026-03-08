import axios from 'axios';

// Use relative URL in production (same server), localhost in development
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000/api/v1'
  : '/api/v1'; // Relative URL for production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  sendOTP: (mobile: string) => api.post('/auth/send-otp', { mobile_number: mobile }),
  verifyOTP: (mobile: string, otp: string) => api.post('/auth/verify-otp', { mobile_number: mobile, otp_code: otp }),
  register: (mobile: string, name: string, location: string, primaryCrop: string, language: string) => 
    api.post('/auth/register', { 
      mobileNumber: mobile, 
      name, 
      location, 
      primaryCrop, 
      language 
    }),
  logout: () => api.post('/auth/logout'),
};

// Disease Detection Service
export const diseaseService = {
  detect: (formData: FormData) => api.post('/diseases/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getHistory: (page = 1, limit = 10) => api.get(`/diseases/history?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get(`/diseases/${id}`),
};

// Advisory Service
export const advisoryService = {
  query: (question: string) => api.post('/advisories/query', { query_text: question }),
  getHistory: (page = 1, limit = 10) => api.get(`/advisories/history?page=${page}&limit=${limit}`),
  rate: (id: number, rating: number) => api.put(`/advisories/${id}/rate`, { rating }),
};

// Schemes Service
export const schemesService = {
  getAll: () => api.get('/schemes'),
  getById: (id: number) => api.get(`/schemes/${id}`),
};

// User Service
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

export default api;
