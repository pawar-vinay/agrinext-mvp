/**
 * Jest Test Setup
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.LOG_LEVEL = 'error';

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
