/**
 * SQL Injection Prevention Utilities
 * Input sanitization and validation functions
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * @param input Input string
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Validate and sanitize mobile number (10 digits)
 * @param mobile Mobile number
 * @returns Sanitized mobile number or null if invalid
 */
export const sanitizeMobileNumber = (mobile: string): string | null => {
  if (typeof mobile !== 'string') {
    return null;
  }
  
  // Remove all non-digit characters
  const digits = mobile.replace(/\D/g, '');
  
  // Validate 10 digits
  if (digits.length !== 10) {
    return null;
  }
  
  return digits;
};

/**
 * Validate and sanitize email address
 * @param email Email address
 * @returns Sanitized email or null if invalid
 */
export const sanitizeEmail = (email: string): string | null => {
  if (typeof email !== 'string') {
    return null;
  }
  
  const sanitized = sanitizeString(email).toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Validate UUID format
 * @param uuid UUID string
 * @returns True if valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  if (typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate integer input
 * @param value Value to validate
 * @param min Minimum value (optional)
 * @param max Maximum value (optional)
 * @returns Validated integer or null if invalid
 */
export const sanitizeInteger = (
  value: any,
  min?: number,
  max?: number
): number | null => {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) {
    return null;
  }
  
  if (max !== undefined && num > max) {
    return null;
  }
  
  return num;
};

/**
 * Sanitize object by removing undefined and null values
 * @param obj Input object
 * @returns Sanitized object
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const sanitized: Partial<T> = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize pagination parameters
 * @param page Page number
 * @param limit Items per page
 * @returns Sanitized pagination parameters
 */
export const sanitizePagination = (
  page: any,
  limit: any
): { page: number; limit: number; offset: number } => {
  const sanitizedPage = sanitizeInteger(page, 1) || 1;
  const sanitizedLimit = sanitizeInteger(limit, 1, 100) || 10;
  const offset = (sanitizedPage - 1) * sanitizedLimit;
  
  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    offset,
  };
};

/**
 * Escape special characters for SQL LIKE queries
 * Note: This is a helper for LIKE queries, but parameterized queries should always be used
 * @param input Input string
 * @returns Escaped string
 */
export const escapeLikeQuery = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Escape special LIKE characters
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
};

/**
 * Validate language code (ISO 639-1)
 * @param lang Language code
 * @returns Valid language code or 'en' as default
 */
export const sanitizeLanguage = (lang: string): string => {
  const validLanguages = ['en', 'hi', 'te'];
  
  if (typeof lang !== 'string') {
    return 'en';
  }
  
  const sanitized = lang.toLowerCase().trim();
  
  if (validLanguages.includes(sanitized)) {
    return sanitized;
  }
  
  return 'en';
};
