/**
 * Integration Tests for Loan Service API
 * 
 * These tests call the deployed backend service to verify:
 * - Authentication is properly enforced
 * - CORS headers are present
 * - Error responses match expected format
 * 
 * Note: These tests do NOT actually create loans as that requires Auth0 authentication.
 * They verify the API endpoints respond correctly to unauthenticated requests.
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Get API base URL from environment variable (set in CI/CD) or use default
const API_BASE_URL = process.env.VITE_LOAN_API_BASE_URL || 'https://campus-loan-service.azurewebsites.net/api';

describe('Loan Service API Integration Tests', () => {
  beforeAll(() => {
    console.log(`Running integration tests against: ${API_BASE_URL}`);
  });

  describe('Authentication & CORS', () => {
    it('should return 401 for unauthenticated reservation request', async () => {
      const response = await fetch(`${API_BASE_URL}/api/loans/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'test-user',
          deviceId: 'test-device'
        })
      });
      
      expect(response.status).toBe(401);
      
      // Verify CORS headers are present
      expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
    });

    it('should handle OPTIONS preflight request for CORS', async () => {
      const response = await fetch(`${API_BASE_URL}/api/loans/reserve`, {
        method: 'OPTIONS'
      });
      
      // Should return 200 or 204 for OPTIONS
      expect([200, 204]).toContain(response.status);
      
      // Verify CORS headers
      expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
      expect(response.headers.get('access-control-allow-methods')).toBeTruthy();
    });
  });

  describe('GET /api/loans/:id', () => {
    it('should return 401 for unauthenticated request', async () => {
      const response = await fetch(`${API_BASE_URL}/api/loans/test-loan-id`);
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/health', () => {
    it('should return health check status', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      
      expect(response.status).toBe(200);
      
      const health = await response.json();
      
      expect(health).toHaveProperty('status');
      expect(health.status).toBe('healthy');
    });
  });

  describe('GET /api/ready', () => {
    it('should return readiness status', async () => {
      const response = await fetch(`${API_BASE_URL}/api/ready`);
      
      // Should be either 200 (ready) or 503 (not ready)
      expect([200, 503]).toContain(response.status);
      
      const readiness = await response.json();
      
      expect(readiness).toHaveProperty('ready');
      expect(typeof readiness.ready).toBe('boolean');
      
      if (readiness.ready) {
        expect(readiness).toHaveProperty('database');
        expect(readiness.database).toBe('connected');
      }
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format for invalid requests', async () => {
      const response = await fetch(`${API_BASE_URL}/api/loans/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing required fields
        })
      });
      
      expect([400, 401]).toContain(response.status);
      
      const errorBody = await response.json();
      
      // Verify error response has error field
      expect(errorBody).toHaveProperty('error');
      expect(typeof errorBody.error).toBe('string');
    });
  });
});
