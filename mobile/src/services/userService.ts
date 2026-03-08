/**
 * User Service
 * Handles user profile operations with offline caching
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { User, ApiResponse } from '../types';
import {
  checkIsOnline,
  cacheUserProfile,
  getCachedUserProfile,
} from './offlineService';

export interface UpdateProfileData {
  name: string;
  location: string;
  primaryCrop: string;
  language: 'en' | 'hi' | 'te';
}

/**
 * Get user profile
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
  try {
    // Try to fetch from API if online
    if (checkIsOnline()) {
      const response = await apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE);
      
      // Cache the profile
      if (response.data) {
        await cacheUserProfile(response.data);
      }
      
      return {
        success: true,
        data: response.data,
      };
    }

    // If offline, return cached profile
    const cachedProfile = await getCachedUserProfile();
    
    if (cachedProfile) {
      return {
        success: true,
        data: cachedProfile,
      };
    }

    return {
      success: false,
      error: 'Profile not found in cache',
    };
  } catch (error: any) {
    // On error, fallback to cache
    const cachedProfile = await getCachedUserProfile();
    
    if (cachedProfile) {
      return {
        success: true,
        data: cachedProfile,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch profile',
    };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  profileData: UpdateProfileData
): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.put<User>(API_ENDPOINTS.USERS.PROFILE, profileData);
    
    // Update cache
    if (response.data) {
      await cacheUserProfile(response.data);
    }
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile',
    };
  }
};
