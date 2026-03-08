/**
 * PostgreSQL database configuration with connection pooling
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import logger from '../utils/logger';

// Force SSL in production
const useSSL = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  min: parseInt(process.env.DB_POOL_MIN || '10', 10),
  max: parseInt(process.env.DB_POOL_MAX || '50', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Reduced to 5 seconds for faster failure
  query_timeout: 5000, // Add query timeout
});

// Log SSL status
logger.info(`Database SSL: ${useSSL ? 'enabled' : 'disabled'}`);

// Connection event handlers
pool.on('connect', () => {
  logger.info('Database connected successfully');
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a database query
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 */
export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error:', {
      text,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Execute a database transaction
 * @param callback Transaction callback function
 * @returns Transaction result
 */
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Test database connection
 * @returns True if connection is successful
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await query('SELECT 1');
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

export default pool;
