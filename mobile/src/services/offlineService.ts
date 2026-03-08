/**
 * Offline Service
 * Handles offline data caching and synchronization
 */

import NetInfo from '@react-native-community/netinfo';
import {
  initDatabase,
  cacheDetection,
  getCachedDetections,
  getCachedDetectionById,
  cacheAdvisory,
  getCachedAdvisories,
  cacheSchemes,
  getCachedSchemes,
  queueOfflineRequest,
  getQueuedRequests,
  removeQueuedRequest,
  incrementRetryCount,
} from '../utils/database';
import { saveData, getData, STORAGE_KEYS } from '../utils/storage';
import { DetectionResult, Advisory, User, GovernmentScheme } from '../types';

// ============================================================================
// Connectivity Management
// ============================================================================

let isOnline = true;
let connectivityListeners: ((online: boolean) => void)[] = [];

/**
 * Initialize offline service
 */
export async function initOfflineService(): Promise<void> {
  // Initialize database
  await initDatabase();

  // Set up connectivity monitoring
  NetInfo.addEventListener((state) => {
    const wasOnline = isOnline;
    isOnline = state.isConnected ?? false;

    // Notify listeners
    connectivityListeners.forEach((listener) => listener(isOnline));

    // If we just came online, sync queued requests
    if (!wasOnline && isOnline) {
      syncQueuedRequests();
    }
  });

  // Get initial connectivity state
  const state = await NetInfo.fetch();
  isOnline = state.isConnected ?? false;
}

/**
 * Check if device is online
 */
export function checkIsOnline(): boolean {
  return isOnline;
}

/**
 * Subscribe to connectivity changes
 */
export function subscribeToConnectivity(listener: (online: boolean) => void): () => void {
  connectivityListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    connectivityListeners = connectivityListeners.filter((l) => l !== listener);
  };
}

// ============================================================================
// User Profile Caching
// ============================================================================

/**
 * Cache user profile
 */
export async function cacheUserProfile(user: User): Promise<void> {
  await saveData(STORAGE_KEYS.USER_PROFILE, user);
}

/**
 * Get cached user profile
 */
export async function getCachedUserProfile(): Promise<User | null> {
  return getData<User>(STORAGE_KEYS.USER_PROFILE);
}

// ============================================================================
// Detection History Caching
// ============================================================================

/**
 * Cache detection history from API response
 */
export async function cacheDetectionHistory(detections: DetectionResult[]): Promise<void> {
  for (const detection of detections) {
    await cacheDetection(detection);
  }
}

/**
 * Get detection history (from cache if offline)
 */
export async function getDetectionHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<DetectionResult[]> {
  const offset = (page - 1) * limit;
  return getCachedDetections(userId, limit, offset);
}

/**
 * Get detection by ID (from cache if offline)
 */
export async function getDetectionById(id: string): Promise<DetectionResult | null> {
  return getCachedDetectionById(id);
}

// ============================================================================
// Advisory History Caching
// ============================================================================

/**
 * Cache advisory history from API response
 */
export async function cacheAdvisoryHistory(advisories: Advisory[]): Promise<void> {
  for (const advisory of advisories) {
    await cacheAdvisory(advisory);
  }
}

/**
 * Get advisory history (from cache if offline)
 */
export async function getAdvisoryHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<Advisory[]> {
  const offset = (page - 1) * limit;
  return getCachedAdvisories(userId, limit, offset);
}

// ============================================================================
// Government Schemes Caching
// ============================================================================

/**
 * Cache government schemes from API response
 */
export async function cacheGovernmentSchemes(schemes: GovernmentScheme[]): Promise<void> {
  await cacheSchemes(schemes);
  await saveData(STORAGE_KEYS.LAST_SYNC, {
    schemes: new Date().toISOString(),
  });
}

/**
 * Get government schemes (from cache if offline)
 */
export async function getGovernmentSchemes(): Promise<GovernmentScheme[]> {
  return getCachedSchemes();
}

/**
 * Check if schemes cache is stale (older than 24 hours)
 */
export async function isSchemeCacheStale(): Promise<boolean> {
  const lastSync = await getData<{ schemes?: string }>(STORAGE_KEYS.LAST_SYNC);
  
  if (!lastSync?.schemes) return true;

  const lastSyncDate = new Date(lastSync.schemes);
  const now = new Date();
  const hoursSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceSync > 24;
}

// ============================================================================
// Offline Request Queue
// ============================================================================

/**
 * Queue request for later sync when offline
 */
export async function queueRequest(
  endpoint: string,
  method: string,
  data: any
): Promise<void> {
  await queueOfflineRequest(endpoint, method, data);
}

/**
 * Sync all queued requests
 */
export async function syncQueuedRequests(): Promise<void> {
  if (!isOnline) return;

  const requests = await getQueuedRequests();

  for (const request of requests) {
    try {
      // Attempt to send the request
      // This would need to be implemented with actual API calls
      // For now, we'll just remove it from the queue
      
      // If successful, remove from queue
      await removeQueuedRequest(request.id);
    } catch (error) {
      // If failed, increment retry count
      await incrementRetryCount(request.id);

      // If retry count exceeds threshold, remove from queue
      if (request.retryCount >= 3) {
        await removeQueuedRequest(request.id);
      }
    }
  }
}

/**
 * Get count of queued requests
 */
export async function getQueuedRequestCount(): Promise<number> {
  const requests = await getQueuedRequests();
  return requests.length;
}
