/**
 * Disease Detection Service
 * Handles disease detection API calls with offline caching
 */

import apiClient from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { DetectionResult, DetectionHistory, ApiResponse, PaginationParams } from '../types';
import {
  checkIsOnline,
  cacheDetectionHistory,
  getDetectionHistory as getCachedHistory,
  getDetectionById as getCachedById,
  queueRequest,
} from './offlineService';

/**
 * Upload image and detect disease
 */
export const detectDisease = async (imageUri: string): Promise<ApiResponse<DetectionResult>> => {
  // Check if online
  if (!checkIsOnline()) {
    // Queue request for later
    await queueRequest(API_ENDPOINTS.DISEASES.DETECT, 'POST', { imageUri });
    
    return {
      success: false,
      error: 'No internet connection. Request queued for sync when online.',
    };
  }

  const formData = new FormData();
  
  // Extract filename from URI
  const filename = imageUri.split('/').pop() || 'image.jpg';
  
  // Create file object for upload
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: filename,
  } as any);

  const response = await apiClient.upload(API_ENDPOINTS.DISEASES.DETECT, formData, API_CONFIG.TIMEOUT.DETECTION);
  
  // Cache the result if successful
  if (response.success && response.data) {
    await cacheDetectionHistory([response.data]);
  }
  
  return response;
};

/**
 * Get detection history with pagination
 */
export const getDetectionHistory = async (
  params: PaginationParams,
  userId: string
): Promise<ApiResponse<DetectionHistory>> => {
  try {
    // Try to fetch from API if online
    if (checkIsOnline()) {
      const response = await apiClient.get(API_ENDPOINTS.DISEASES.HISTORY, {
        params: {
          page: params.page,
          limit: params.limit,
        },
      });

      // Cache the results
      if (response.success && response.data?.detections) {
        await cacheDetectionHistory(response.data.detections);
      }

      return response;
    }

    // If offline, return cached data
    const cachedDetections = await getCachedHistory(userId, params.page, params.limit);
    
    return {
      success: true,
      data: {
        detections: cachedDetections,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: cachedDetections.length,
          totalPages: 1,
        },
      },
    };
  } catch (error: any) {
    // On error, fallback to cache
    const cachedDetections = await getCachedHistory(userId, params.page, params.limit);
    
    return {
      success: true,
      data: {
        detections: cachedDetections,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: cachedDetections.length,
          totalPages: 1,
        },
      },
    };
  }
};

/**
 * Get detection details by ID
 */
export const getDetectionById = async (id: string): Promise<ApiResponse<DetectionResult>> => {
  try {
    // Try to fetch from API if online
    if (checkIsOnline()) {
      const response = await apiClient.get(API_ENDPOINTS.DISEASES.DETAIL(id));

      // Cache the result
      if (response.success && response.data) {
        await cacheDetectionHistory([response.data]);
      }

      return response;
    }

    // If offline, return cached data
    const cachedDetection = await getCachedById(id);
    
    if (cachedDetection) {
      return {
        success: true,
        data: cachedDetection,
      };
    }

    return {
      success: false,
      error: 'Detection not found in cache',
    };
  } catch (error: any) {
    // On error, fallback to cache
    const cachedDetection = await getCachedById(id);
    
    if (cachedDetection) {
      return {
        success: true,
        data: cachedDetection,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch detection',
    };
  }
};
