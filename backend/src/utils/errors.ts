/**
 * Custom error classes for Agrinext Backend
 * Provides structured error handling with HTTP status codes
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly retryAfter?: number;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: any,
    retryAfter?: number
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request errors
export class BadRequestError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(400, code, message, details);
  }
}

// 401 Unauthorized errors
export class UnauthorizedError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(401, code, message, details);
  }
}

// 403 Forbidden errors
export class ForbiddenError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(403, code, message, details);
  }
}

// 404 Not Found errors
export class NotFoundError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(404, code, message, details);
  }
}

// 429 Too Many Requests errors
export class RateLimitError extends AppError {
  constructor(code: string, message: string, retryAfter: number, details?: any) {
    super(429, code, message, details, retryAfter);
  }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(500, code, message, details);
  }
}

// 503 Service Unavailable errors
export class ServiceUnavailableError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(503, code, message, details);
  }
}

// 504 Gateway Timeout errors
export class GatewayTimeoutError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(504, code, message, details);
  }
}

// Specific error types for common scenarios
export class ValidationError extends BadRequestError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details);
  }
}

export class InvalidOTPError extends UnauthorizedError {
  constructor(message: string = 'Invalid or expired OTP') {
    super('INVALID_OTP', message);
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(message: string = 'Invalid or expired token') {
    super('INVALID_TOKEN', message);
  }
}

export class OTPRateLimitError extends RateLimitError {
  constructor(retryAfter: number) {
    super(
      'OTP_RATE_LIMIT_EXCEEDED',
      'Too many OTP requests. Please try again later.',
      retryAfter
    );
  }
}

export class ExternalServiceError extends ServiceUnavailableError {
  constructor(service: string, message?: string) {
    super(
      'EXTERNAL_SERVICE_ERROR',
      message || `${service} service is temporarily unavailable`
    );
  }
}
