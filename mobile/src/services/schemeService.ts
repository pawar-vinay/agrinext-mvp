/**
 * Government Schemes Service
 * Handles government schemes API calls with offline caching
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { GovernmentScheme, ApiResponse } from '../types';
import {
  checkIsOnline,
  cacheGovernmentSchemes,
  getGovernmentSchemes as getCachedSchemes,
  isSchemeCacheStale,
} from './offlineService';

/**
 * Get all schemes with optional filters
 */
export const getSchemes = async (
  category?: string,
  keyword?: string
): Promise<ApiResponse<GovernmentScheme[]>> => {
  try {
    // Check if we should fetch from API
    const shouldFetch = checkIsOnline() && (await isSchemeCacheStale());

    if (shouldFetch) {
      const params: any = {};
      if (category) params.category = category;
      if (keyword) params.keyword = keyword;

      const response = await apiClient.get(API_ENDPOINTS.SCHEMES.LIST, { params });

      // Cache the results
      if (response.success && response.data) {
        await cacheGovernmentSchemes(response.data);
      }

      return response;
    }

    // Return cached data
    const cachedSchemes = await getCachedSchemes();
    
    // Apply filters if provided
    let filteredSchemes = cachedSchemes;
    
    if (category) {
      filteredSchemes = filteredSchemes.filter(
        (scheme) => scheme.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredSchemes = filteredSchemes.filter(
        (scheme) =>
          scheme.name.toLowerCase().includes(lowerKeyword) ||
          scheme.description.toLowerCase().includes(lowerKeyword)
      );
    }

    return {
      success: true,
      data: filteredSchemes,
    };
  } catch (error: any) {
    // On error, fallback to cache
    const cachedSchemes = await getCachedSchemes();
    
    return {
      success: true,
      data: cachedSchemes,
    };
  }
};

/**
 * Get scheme details by ID
 */
export const getSchemeById = async (id: string): Promise<ApiResponse<GovernmentScheme>> => {
  try {
    // Try to fetch from API if online
    if (checkIsOnline()) {
      return apiClient.get(API_ENDPOINTS.SCHEMES.DETAIL(id));
    }

    // If offline, search in cache
    const cachedSchemes = await getCachedSchemes();
    const scheme = cachedSchemes.find((s) => s.id === id);

    if (scheme) {
      return {
        success: true,
        data: scheme,
      };
    }

    return {
      success: false,
      error: 'Scheme not found in cache',
    };
  } catch (error: any) {
    // On error, fallback to cache
    const cachedSchemes = await getCachedSchemes();
    const scheme = cachedSchemes.find((s) => s.id === id);

    if (scheme) {
      return {
        success: true,
        data: scheme,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch scheme',
    };
  }
};
