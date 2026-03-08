/**
 * Unit Tests for Agrinext Backend Server
 * Tests health check and API endpoints
 */

const request = require('supertest');
const app = require('../src/server');

describe('Agrinext Backend Server', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app).get('/health');
      
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should return positive uptime', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /api/v1', () => {
    it('should return 200 and API information', async () => {
      const response = await request(app).get('/api/v1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Agrinext API v1');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
    });

    it('should list all available endpoints', async () => {
      const response = await request(app).get('/api/v1');
      
      const endpoints = response.body.endpoints;
      expect(endpoints).toHaveProperty('health');
      expect(endpoints).toHaveProperty('auth');
      expect(endpoints).toHaveProperty('users');
      expect(endpoints).toHaveProperty('diseases');
      expect(endpoints).toHaveProperty('advisories');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.message).toContain('not found');
    });

    it('should include route information in 404 response', async () => {
      const response = await request(app).get('/invalid/path');
      
      expect(response.body.message).toContain('GET');
      expect(response.body.message).toContain('/invalid/path');
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should include security headers from helmet', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
