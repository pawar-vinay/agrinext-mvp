/**
 * Advisory Service
 * Handles farming advisory API calls with offline caching
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { Advisory, AdvisoryHistory, ApiResponse, PaginationParams } from '../types';
import {
  checkIsOnline,
  cacheAdvisoryHistory,
  getAdvisoryHistory as getCachedHistory,
  queueRequest,
} from './offlineService';

/**
 * Submit farming question
 */
export const submitQuery = async (query: string): Promise<ApiResponse<Advisory>> => {
  // Check if online
  if (!checkIsOnline()) {
    // Queue request for later
    await queueRequest(API_ENDPOINTS.ADVISORIES.QUERY, 'POST', { query });
    
    return {
      success: false,
      error: 'No internet connection. Request queued for sync when online.',
    };
  }

  const response = await apiClient.post(API_ENDPOINTS.ADVISORIES.QUERY, { query });
  
  // Cache the result if successful
  if (response.success && response.data) {
    await cacheAdvisoryHistory([response.data]);
  }
  
  return response;
};

/**
 * Get advisory history with pagination
 */
export const getAdvisoryHistory = async (
  params: PaginationParams,
  userId: string
): Promise<ApiResponse<AdvisoryHistory>> => {
  try {
    // Try to fetch from API if online
    if (checkIsOnline()) {
      const response = await apiClient.get(API_ENDPOINTS.ADVISORIES.HISTORY, {
        params: {
          page: params.page,
          limit: params.limit,
        },
      });

      // Cache the results
      if (response.success && response.data?.advisories) {
        await cacheAdvisoryHistory(response.data.advisories);
      }

      return response;
    }

    // If offline, return cached data
    const cachedAdvisories = await getCachedHistory(userId, params.page, params.limit);
    
    return {
      success: true,
      data: {
        advisories: cachedAdvisories,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: cachedAdvisories.length,
          totalPages: 1,
        },
      },
    };
  } catch (error: any) {
    // On error, fallback to cache
    const cachedAdvisories = await getCachedHistory(userId, params.page, params.limit);
    
    return {
      success: true,
      data: {
        advisories: cachedAdvisories,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: cachedAdvisories.length,
          totalPages: 1,
        },
      },
    };
  }
};

/**
 * Rate advisory response
 */
export const rateAdvisory = async (id: string, rating: number): Promise<ApiResponse<Advisory>> => {
  // Check if online
  if (!checkIsOnline()) {
    // Queue request for later
    await queueRequest(API_ENDPOINTS.ADVISORIES.RATE(id), 'PUT', { rating });
    
    return {
      success: false,
      error: 'No internet connection. Request queued for sync when online.',
    };
  }

  return apiClient.put(API_ENDPOINTS.ADVISORIES.RATE(id), { rating });
};
