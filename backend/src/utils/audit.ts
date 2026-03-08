/**
 * Audit Logging Utilities
 * Handles logging of significant system events to audit_logs table
 */

import { query } from '../config/database';
import logger from './logger';

interface AuditLogEntry {
  userId?: string;
  action: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  errorMessage?: string;
  responseTimeMs?: number;
  ipAddress?: string;
}

/**
 * Log event to audit_logs table
 * @param entry Audit log entry
 */
export const logAuditEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    await query(
      `INSERT INTO audit_logs (
        user_id, action, endpoint, method, status_code,
        error_message, response_time_ms, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        entry.userId || null,
        entry.action,
        entry.endpoint || null,
        entry.method || null,
        entry.statusCode || null,
        entry.errorMessage || null,
        entry.responseTimeMs || null,
        entry.ipAddress || null,
      ]
    );
  } catch (error) {
    // Don't throw error - audit logging failure shouldn't break the application
    logger.error('Failed to log audit event:', error);
  }
};

/**
 * Log authentication event
 * @param userId User ID
 * @param action Action type (login, logout, register, etc.)
 * @param success Whether the action was successful
 * @param ipAddress IP address
 */
export const logAuthEvent = async (
  userId: string | undefined,
  action: string,
  success: boolean,
  ipAddress?: string
): Promise<void> => {
  await logAuditEvent({
    userId,
    action: `auth_${action}`,
    statusCode: success ? 200 : 401,
    ipAddress,
  });
};

/**
 * Log API request
 * @param userId User ID
 * @param method HTTP method
 * @param endpoint Endpoint path
 * @param statusCode Response status code
 * @param responseTimeMs Response time in milliseconds
 * @param ipAddress IP address
 */
export const logAPIRequest = async (
  userId: string | undefined,
  method: string,
  endpoint: string,
  statusCode: number,
  responseTimeMs: number,
  ipAddress?: string
): Promise<void> => {
  await logAuditEvent({
    userId,
    action: 'api_request',
    method,
    endpoint,
    statusCode,
    responseTimeMs,
    ipAddress,
  });
};

/**
 * Log error
 * @param userId User ID
 * @param endpoint Endpoint path
 * @param method HTTP method
 * @param errorMessage Error message
 * @param ipAddress IP address
 */
export const logError = async (
  userId: string | undefined,
  endpoint: string,
  method: string,
  errorMessage: string,
  ipAddress?: string
): Promise<void> => {
  await logAuditEvent({
    userId,
    action: 'error',
    endpoint,
    method,
    errorMessage,
    statusCode: 500,
    ipAddress,
  });
};

/**
 * Log security event
 * @param userId User ID
 * @param action Security action (invalid_token, rate_limit, etc.)
 * @param endpoint Endpoint path
 * @param ipAddress IP address
 */
export const logSecurityEvent = async (
  userId: string | undefined,
  action: string,
  endpoint: string,
  ipAddress?: string
): Promise<void> => {
  await logAuditEvent({
    userId,
    action: `security_${action}`,
    endpoint,
    statusCode: 403,
    ipAddress,
  });
};

/**
 * Log user action
 * @param userId User ID
 * @param action User action (profile_update, scheme_view, etc.)
 * @param details Additional details
 */
export const logUserAction = async (
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> => {
  await logAuditEvent({
    userId,
    action: `user_${action}`,
    errorMessage: details ? JSON.stringify(details) : undefined,
  });
};
