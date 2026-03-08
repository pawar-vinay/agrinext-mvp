/**
 * API Client Service
 * Axios-based HTTP client with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, getApiUrl } from '../config/api';
import { getTokens, storeTokens, removeTokens } from '../utils/secureStorage';
import { ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private refreshing: boolean = false;
  private refreshQueue: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`,
      timeout: API_CONFIG.TIMEOUT.DEFAULT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const tokens = await getTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // Wait for token refresh
            return new Promise((resolve) => {
              this.refreshQueue.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const tokens = await getTokens();
            if (!tokens?.refreshToken) {
              throw new Error('No refresh token');
            }

            // Refresh token
            const response = await axios.post(
              getApiUrl('/auth/refresh-token'),
              { refreshToken: tokens.refreshToken }
            );

            const newAccessToken = response.data.data.accessToken;

            // Store new token
            await storeTokens({
              accessToken: newAccessToken,
              refreshToken: tokens.refreshToken,
            });

            // Retry queued requests
            this.refreshQueue.forEach((callback) => callback(newAccessToken));
            this.refreshQueue = [];

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - Clear tokens and redirect to login
            await removeTokens();
            this.refreshQueue = [];
            return Promise.reject(refreshError);
          } finally {
            this.refreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload<T>(url: string, formData: FormData, timeout?: number): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: timeout || API_CONFIG.TIMEOUT.DETECTION,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiResponse<any> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response) {
        // Server responded with error
        return {
          success: false,
          error: axiosError.response.data?.error || axiosError.response.data?.message || 'Server error',
        };
      } else if (axiosError.request) {
        // No response received
        return {
          success: false,
          error: 'Network error. Please check your connection.',
        };
      }
    }

    // Unknown error
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export default new ApiClient();
