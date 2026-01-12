
import { describe, it, expect, beforeEach } from 'vitest';
import { listDevices } from './list-devices';
import { searchDevices } from './search-devices';
import { Device } from '../domain/device';
import { DeviceRepo } from '../domain/device-repo';

class MockDeviceRepo implements DeviceRepo {
  private devices: Device[] = [];

  constructor(initialDevices: Device[] = []) {
    this.devices = [...initialDevices];
  }

  async list(): Promise<Device[]> {
    return [...this.devices];
  }

  async getById(id: string): Promise<Device | null> {
    return this.devices.find((d) => d.id === id) || null;
  }

  async save(device: Device): Promise<Device> {
    const index = this.devices.findIndex((d) => d.id === device.id);
    if (index >= 0) {
      this.devices[index] = device;
    } else {
      this.devices.push(device);
    }
    return device;
  }

  async delete(id: string): Promise<void> {
    const index = this.devices.findIndex((d) => d.id === id);
    if (index >= 0) {
      this.devices.splice(index, 1);
    }
  }
}

describe('Application Layer Use Cases', () => {
  const sampleDevices: Device[] = [
    {
      id: '1',
      brand: 'Dell',
      model: 'XPS 15',
      category: 'laptop',
      totalCount: 5,
      availableCount: 3,
    },
    {
      id: '2',
      brand: 'Apple',
      model: 'MacBook Pro',
      category: 'laptop',
      totalCount: 4,
      availableCount: 0,
    },
    {
      id: '3',
      brand: 'Apple',
      model: 'iPad Air',
      category: 'tablet',
      totalCount: 10,
      availableCount: 7,
    },
    {
      id: '4',
      brand: 'Canon',
      model: 'EOS R6',
      category: 'camera',
      totalCount: 2,
      availableCount: 1,
    },
  ];

  describe('listDevices', () => {
    it('should return all devices from repository', async () => {
      const repo = new MockDeviceRepo(sampleDevices);
      const devices = await listDevices({ deviceRepo: repo });

      expect(devices).toHaveLength(4);
      expect(devices[0].brand).toBe('Dell');
    });

    it('should return empty array when no devices exist', async () => {
      const repo = new MockDeviceRepo([]);
      const devices = await listDevices({ deviceRepo: repo });

      expect(devices).toHaveLength(0);
    });
  });

  describe('searchDevices', () => {
    let repo: MockDeviceRepo;

    beforeEach(() => {
      repo = new MockDeviceRepo(sampleDevices);
    });

    it('should filter by category', async () => {
      const laptops = await searchDevices(repo, { category: 'laptop' });

      expect(laptops).toHaveLength(2);
      expect(laptops.every((d) => d.category === 'laptop')).toBe(true);
    });

    it('should filter by availableOnly', async () => {
      const available = await searchDevices(repo, { availableOnly: true });

      expect(available).toHaveLength(3);
      expect(available.every((d) => d.availableCount > 0)).toBe(true);
    });

    it('should filter by minAvailability', async () => {
      const minThree = await searchDevices(repo, { minAvailability: 3 });

      expect(minThree).toHaveLength(2);
      expect(minThree.every((d) => d.availableCount >= 3)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const result = await searchDevices(repo, {
        category: 'laptop',
        availableOnly: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].brand).toBe('Dell');
      expect(result[0].category).toBe('laptop');
      expect(result[0].availableCount).toBeGreaterThan(0);
    });

    it('should return all devices when no filters provided', async () => {
      const result = await searchDevices(repo, {});

      expect(result).toHaveLength(4);
    });

    it('should filter category and minAvailability together', async () => {
      const result = await searchDevices(repo, {
        category: 'tablet',
        minAvailability: 5,
      });

      expect(result).toHaveLength(1);
      expect(result[0].model).toBe('iPad Air');
      expect(result[0].availableCount).toBe(7);
    });

    it('should return empty array when filters match nothing', async () => {
      const result = await searchDevices(repo, {
        category: 'camera',
        minAvailability: 10,
      });

      expect(result).toHaveLength(0);
    });
  });
});
