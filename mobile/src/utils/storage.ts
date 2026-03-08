/**
 * AsyncStorage Wrapper for Simple Key-Value Data
 * Provides type-safe storage utilities for offline functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@agrinext:user_profile',
  AUTH_TOKENS: '@agrinext:auth_tokens',
  LANGUAGE: '@agrinext:language',
  OFFLINE_QUEUE: '@agrinext:offline_queue',
  LAST_SYNC: '@agrinext:last_sync',
} as const;

/**
 * Save data to AsyncStorage
 * @param key Storage key
 * @param value Data to store (will be JSON stringified)
 */
export async function saveData<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw new Error(`Failed to save data: ${error}`);
  }
}

/**
 * Get data from AsyncStorage
 * @param key Storage key
 * @returns Parsed data or null if not found
 */
export async function getData<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    throw new Error(`Failed to get data: ${error}`);
  }
}

/**
 * Remove data from AsyncStorage
 * @param key Storage key
 */
export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw new Error(`Failed to remove data: ${error}`);
  }
}

/**
 * Clear all data from AsyncStorage
 * Use with caution - this removes all app data
 */
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw new Error(`Failed to clear all data: ${error}`);
  }
}

/**
 * Get multiple items from AsyncStorage
 * @param keys Array of storage keys
 * @returns Array of [key, value] pairs
 */
export async function getMultiple(keys: string[]): Promise<[string, string | null][]> {
  try {
    return await AsyncStorage.multiGet(keys);
  } catch (error) {
    console.error('Error getting multiple items:', error);
    throw new Error(`Failed to get multiple items: ${error}`);
  }
}

/**
 * Set multiple items in AsyncStorage
 * @param keyValuePairs Array of [key, value] pairs
 */
export async function setMultiple(keyValuePairs: [string, string][]): Promise<void> {
  try {
    await AsyncStorage.multiSet(keyValuePairs);
  } catch (error) {
    console.error('Error setting multiple items:', error);
    throw new Error(`Failed to set multiple items: ${error}`);
  }
}
