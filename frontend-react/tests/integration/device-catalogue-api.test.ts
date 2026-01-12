
import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://campus-device-catalogue.azurewebsites.net/api';

describe('Device Catalogue API Integration Tests', () => {
  beforeAll(() => {
    console.log(`Running integration tests against: ${API_BASE_URL}`);
  });

  describe('GET /api/devices', () => {
    it('should return a list of devices', async () => {
      const response = await fetch(`${API_BASE_URL}/api/devices`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const devices = await response.json();

      expect(Array.isArray(devices)).toBe(true);

      if (devices.length > 0) {
        const device = devices[0];

        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('brand');
        expect(device).toHaveProperty('model');
        expect(device).toHaveProperty('category');
        expect(device).toHaveProperty('totalCount');
        expect(device).toHaveProperty('availableCount');

        expect(typeof device.id).toBe('string');
        expect(typeof device.brand).toBe('string');
        expect(typeof device.model).toBe('string');
        expect(typeof device.category).toBe('string');
        expect(typeof device.totalCount).toBe('number');
        expect(typeof device.availableCount).toBe('number');
      }
    });
  });

  describe('GET /api/devices/:id', () => {
    it('should return a specific device by ID', async () => {

      const listResponse = await fetch(`${API_BASE_URL}/api/devices`);
      const devices = await listResponse.json();

      if (devices.length === 0) {
        console.log('No devices available to test GET by ID');
        return;
      }

      const deviceId = devices[0].id;

      const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`);

      expect(response.status).toBe(200);

      const device = await response.json();

      expect(device.id).toBe(deviceId);
      expect(device).toHaveProperty('brand');
      expect(device).toHaveProperty('model');
    });

    it('should return 404 for non-existent device', async () => {
      const fakeId = 'non-existent-device-id-12345';
      const response = await fetch(`${API_BASE_URL}/api/devices/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/devices/search', () => {
    it('should search devices by category', async () => {
      const response = await fetch(`${API_BASE_URL}/api/devices/search?category=laptop`);

      expect(response.status).toBe(200);

      const devices = await response.json();

      expect(Array.isArray(devices)).toBe(true);

      devices.forEach((device: { category: string }) => {
        expect(device.category.toLowerCase()).toBe('laptop');
      });
    });

    it('should return empty array for non-matching search', async () => {
      const response = await fetch(`${API_BASE_URL}/api/devices/search?category=nonexistentcategory12345`);

      expect(response.status).toBe(200);

      const devices = await response.json();

      expect(Array.isArray(devices)).toBe(true);
      expect(devices.length).toBe(0);
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

      expect([200, 503]).toContain(response.status);

      const readiness = await response.json();

      expect(readiness).toHaveProperty('ready');
      expect(typeof readiness.ready).toBe('boolean');
    });
  });
});
