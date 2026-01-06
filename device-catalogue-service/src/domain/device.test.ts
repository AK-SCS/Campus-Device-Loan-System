/**
 * Device Domain Tests
 * Testing pure domain logic - no external dependencies
 */

import { describe, it, expect } from 'vitest';
import { createDevice, updateAvailability, isAvailable, Device } from './device';

describe('Device Domain', () => {
  describe('createDevice', () => {
    it('should create a valid device with all fields', () => {
      const device = createDevice({
        brand: 'Dell',
        model: 'XPS 15',
        category: 'laptop',
        totalCount: 5,
        availableCount: 3,
      });

      expect(device.id).toBeDefined();
      expect(device.brand).toBe('Dell');
      expect(device.model).toBe('XPS 15');
      expect(device.category).toBe('laptop');
      expect(device.totalCount).toBe(5);
      expect(device.availableCount).toBe(3);
    });

    it('should default availableCount to totalCount if not provided', () => {
      const device = createDevice({
        brand: 'Apple',
        model: 'iPad Air',
        category: 'tablet',
        totalCount: 10,
      });

      expect(device.availableCount).toBe(10);
    });

    it('should trim whitespace from brand and model', () => {
      const device = createDevice({
        brand: '  HP  ',
        model: '  EliteBook  ',
        category: 'laptop',
        totalCount: 5,
      });

      expect(device.brand).toBe('HP');
      expect(device.model).toBe('EliteBook');
    });

    it('should throw error if brand is missing', () => {
      expect(() =>
        createDevice({
          brand: '',
          model: 'Test Model',
          category: 'laptop',
          totalCount: 5,
        })
      ).toThrow('Device brand is required');
    });

    it('should throw error if model is missing', () => {
      expect(() =>
        createDevice({
          brand: 'Test Brand',
          model: '   ',
          category: 'laptop',
          totalCount: 5,
        })
      ).toThrow('Device model is required');
    });

    it('should throw error for invalid category', () => {
      expect(() =>
        createDevice({
          brand: 'Test',
          model: 'Test',
          category: 'invalid' as any,
          totalCount: 5,
        })
      ).toThrow('Invalid device category');
    });

    it('should throw error if totalCount is negative', () => {
      expect(() =>
        createDevice({
          brand: 'Test',
          model: 'Test',
          category: 'laptop',
          totalCount: -5,
        })
      ).toThrow('Total count must be a non-negative number');
    });

    it('should throw error if availableCount exceeds totalCount', () => {
      expect(() =>
        createDevice({
          brand: 'Test',
          model: 'Test',
          category: 'laptop',
          totalCount: 5,
          availableCount: 10,
        })
      ).toThrow('Available count cannot exceed total count');
    });

    it('should accept all valid categories', () => {
      const categories = ['laptop', 'tablet', 'camera', 'other'] as const;

      categories.forEach((category) => {
        const device = createDevice({
          brand: 'Test',
          model: 'Test',
          category,
          totalCount: 5,
        });

        expect(device.category).toBe(category);
      });
    });
  });

  describe('updateAvailability', () => {
    const baseDevice: Device = {
      id: 'test-device-1',
      brand: 'Dell',
      model: 'XPS 15',
      category: 'laptop',
      totalCount: 10,
      availableCount: 5,
    };

    it('should decrease availability when device is reserved', () => {
      const updated = updateAvailability(baseDevice, -1);

      expect(updated.availableCount).toBe(4);
      expect(updated.totalCount).toBe(10);
    });

    it('should increase availability when device is returned', () => {
      const updated = updateAvailability(baseDevice, 1);

      expect(updated.availableCount).toBe(6);
      expect(updated.totalCount).toBe(10);
    });

    it('should throw error if trying to reserve more than available', () => {
      expect(() => updateAvailability(baseDevice, -6)).toThrow(
        'Not enough devices available'
      );
    });

    it('should throw error if return would exceed total count', () => {
      expect(() => updateAvailability(baseDevice, 6)).toThrow(
        'Available count cannot exceed total count'
      );
    });

    it('should allow decreasing to zero', () => {
      const updated = updateAvailability(baseDevice, -5);

      expect(updated.availableCount).toBe(0);
    });

    it('should allow increasing to total count', () => {
      const updated = updateAvailability(baseDevice, 5);

      expect(updated.availableCount).toBe(10);
    });

    it('should not mutate the original device', () => {
      const originalAvailable = baseDevice.availableCount;
      updateAvailability(baseDevice, -1);

      expect(baseDevice.availableCount).toBe(originalAvailable);
    });
  });

  describe('isAvailable', () => {
    it('should return true when devices are available', () => {
      const device: Device = {
        id: 'test-1',
        brand: 'Dell',
        model: 'XPS',
        category: 'laptop',
        totalCount: 5,
        availableCount: 3,
      };

      expect(isAvailable(device)).toBe(true);
    });

    it('should return false when no devices are available', () => {
      const device: Device = {
        id: 'test-1',
        brand: 'Dell',
        model: 'XPS',
        category: 'laptop',
        totalCount: 5,
        availableCount: 0,
      };

      expect(isAvailable(device)).toBe(false);
    });

    it('should return true for single available device', () => {
      const device: Device = {
        id: 'test-1',
        brand: 'Dell',
        model: 'XPS',
        category: 'laptop',
        totalCount: 5,
        availableCount: 1,
      };

      expect(isAvailable(device)).toBe(true);
    });
  });
});
