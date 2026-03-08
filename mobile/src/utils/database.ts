/**
 * SQLite Database Wrapper for Structured Offline Data
 * Provides type-safe database utilities for caching detection and advisory history
 */

import SQLite from 'react-native-sqlite-storage';
import { DetectionResult, Advisory } from '../types';

// Enable promise API
SQLite.enablePromise(true);

const DATABASE_NAME = 'agrinext.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'Agrinext Offline Database';
const DATABASE_SIZE = 5 * 1024 * 1024; // 5MB

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database and create tables
 */
export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });

    // Create detection history table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS detection_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        disease_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        recommendations TEXT NOT NULL,
        image_url TEXT NOT NULL,
        image_metadata TEXT,
        detected_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create advisory history table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS advisory_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        rating INTEGER,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      )
    `);

    // Create government schemes cache table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS schemes_cache (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        eligibility TEXT,
        benefits TEXT,
        application_process TEXT,
        cached_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create offline request queue table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error(`Failed to initialize database: ${error}`);
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('Database closed');
  }
}

/**
 * Clear all cached data (for testing or logout)
 */
export async function clearAllCache(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql('DELETE FROM detection_history');
  await db.executeSql('DELETE FROM advisory_history');
  await db.executeSql('DELETE FROM schemes_cache');
  await db.executeSql('DELETE FROM offline_queue');
  
  console.log('All cache cleared');
}

// ============================================================================
// Detection History Operations
// ============================================================================

/**
 * Cache detection result
 */
export async function cacheDetection(detection: DetectionResult): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql(
    `INSERT OR REPLACE INTO detection_history 
     (id, user_id, disease_name, severity, confidence_score, recommendations, 
      image_url, image_metadata, detected_at, synced) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      detection.id,
      detection.userId,
      detection.diseaseName,
      detection.severity,
      detection.confidenceScore,
      detection.recommendations,
      detection.imageUrl,
      JSON.stringify(detection.imageMetadata),
      detection.detectedAt,
      1, // Mark as synced since it came from API
    ]
  );
}

/**
 * Get cached detection history
 */
export async function getCachedDetections(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<DetectionResult[]> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql(
    `SELECT * FROM detection_history 
     WHERE user_id = ? 
     ORDER BY detected_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const detections: DetectionResult[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    detections.push({
      id: row.id,
      userId: row.user_id,
      diseaseName: row.disease_name,
      severity: row.severity,
      confidenceScore: row.confidence_score,
      recommendations: row.recommendations,
      imageUrl: row.image_url,
      imageMetadata: JSON.parse(row.image_metadata || '{}'),
      detectedAt: row.detected_at,
    });
  }

  return detections;
}

/**
 * Get cached detection by ID
 */
export async function getCachedDetectionById(id: string): Promise<DetectionResult | null> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql(
    'SELECT * FROM detection_history WHERE id = ?',
    [id]
  );

  if (results.rows.length === 0) return null;

  const row = results.rows.item(0);
  return {
    id: row.id,
    userId: row.user_id,
    diseaseName: row.disease_name,
    severity: row.severity,
    confidenceScore: row.confidence_score,
    recommendations: row.recommendations,
    imageUrl: row.image_url,
    imageMetadata: JSON.parse(row.image_metadata || '{}'),
    detectedAt: row.detected_at,
  };
}

// ============================================================================
// Advisory History Operations
// ============================================================================

/**
 * Cache advisory result
 */
export async function cacheAdvisory(advisory: Advisory): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql(
    `INSERT OR REPLACE INTO advisory_history 
     (id, user_id, query, response, rating, created_at, synced) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      advisory.id,
      advisory.userId,
      advisory.query,
      advisory.response,
      advisory.rating || null,
      advisory.createdAt,
      1, // Mark as synced since it came from API
    ]
  );
}

/**
 * Get cached advisory history
 */
export async function getCachedAdvisories(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Advisory[]> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql(
    `SELECT * FROM advisory_history 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const advisories: Advisory[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    advisories.push({
      id: row.id,
      userId: row.user_id,
      query: row.query,
      response: row.response,
      rating: row.rating,
      createdAt: row.created_at,
    });
  }

  return advisories;
}

// ============================================================================
// Government Schemes Cache Operations
// ============================================================================

/**
 * Cache government schemes
 */
export async function cacheSchemes(schemes: any[]): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  // Clear old cache
  await db.executeSql('DELETE FROM schemes_cache');

  // Insert new schemes
  for (const scheme of schemes) {
    await db.executeSql(
      `INSERT INTO schemes_cache 
       (id, name, description, category, eligibility, benefits, application_process) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        scheme.id,
        scheme.name,
        scheme.description,
        scheme.category,
        scheme.eligibility || '',
        scheme.benefits || '',
        scheme.applicationProcess || '',
      ]
    );
  }
}

/**
 * Get cached schemes
 */
export async function getCachedSchemes(): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql('SELECT * FROM schemes_cache');

  const schemes: any[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    schemes.push({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      eligibility: row.eligibility,
      benefits: row.benefits,
      applicationProcess: row.application_process,
    });
  }

  return schemes;
}

// ============================================================================
// Offline Queue Operations
// ============================================================================

/**
 * Add request to offline queue
 */
export async function queueOfflineRequest(
  endpoint: string,
  method: string,
  data: any
): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql(
    'INSERT INTO offline_queue (endpoint, method, data) VALUES (?, ?, ?)',
    [endpoint, method, JSON.stringify(data)]
  );
}

/**
 * Get all queued requests
 */
export async function getQueuedRequests(): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql(
    'SELECT * FROM offline_queue ORDER BY created_at ASC'
  );

  const requests: any[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    requests.push({
      id: row.id,
      endpoint: row.endpoint,
      method: row.method,
      data: JSON.parse(row.data),
      createdAt: row.created_at,
      retryCount: row.retry_count,
    });
  }

  return requests;
}

/**
 * Remove request from queue
 */
export async function removeQueuedRequest(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql('DELETE FROM offline_queue WHERE id = ?', [id]);
}

/**
 * Increment retry count for a queued request
 */
export async function incrementRetryCount(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql(
    'UPDATE offline_queue SET retry_count = retry_count + 1 WHERE id = ?',
    [id]
  );
}

/**
 * Clear all queued requests
 */
export async function clearQueue(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql('DELETE FROM offline_queue');
}
