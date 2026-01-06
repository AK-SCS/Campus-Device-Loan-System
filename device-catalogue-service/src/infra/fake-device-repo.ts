import { Device } from '../domain/device';
import { DeviceRepo } from '../domain/device-repo';

/**
 * In-memory implementation of DeviceRepo for local development.
 * Contains sample devices across different categories.
 */
export class FakeDeviceRepo implements DeviceRepo {
  private devices: Device[] = [
    // Laptops
    {
      id: '1',
      brand: 'Dell',
      model: 'XPS 15',
      category: 'laptop',
      totalCount: 5,
      availableCount: 3
    },
    {
      id: '2',
      brand: 'HP',
      model: 'EliteBook 840',
      category: 'laptop',
      totalCount: 8,
      availableCount: 5
    },
    {
      id: '3',
      brand: 'Lenovo',
      model: 'ThinkPad X1 Carbon',
      category: 'laptop',
      totalCount: 6,
      availableCount: 2
    },
    {
      id: '4',
      brand: 'Apple',
      model: 'MacBook Pro 14"',
      category: 'laptop',
      totalCount: 4,
      availableCount: 0
    },
    // Tablets
    {
      id: '5',
      brand: 'Apple',
      model: 'iPad Air',
      category: 'tablet',
      totalCount: 10,
      availableCount: 7
    },
    {
      id: '6',
      brand: 'Samsung',
      model: 'Galaxy Tab S8',
      category: 'tablet',
      totalCount: 6,
      availableCount: 4
    },
    {
      id: '7',
      brand: 'Microsoft',
      model: 'Surface Pro 9',
      category: 'tablet',
      totalCount: 5,
      availableCount: 5
    },
    // Cameras
    {
      id: '8',
      brand: 'Canon',
      model: 'EOS R6',
      category: 'camera',
      totalCount: 3,
      availableCount: 1
    },
    {
      id: '9',
      brand: 'Sony',
      model: 'Alpha A7 IV',
      category: 'camera',
      totalCount: 2,
      availableCount: 2
    },
    {
      id: '10',
      brand: 'Nikon',
      model: 'Z6 II',
      category: 'camera',
      totalCount: 2,
      availableCount: 0
    },
    // Other devices
    {
      id: '11',
      brand: 'GoPro',
      model: 'Hero 11 Black',
      category: 'other',
      totalCount: 4,
      availableCount: 3
    },
    {
      id: '12',
      brand: 'DJI',
      model: 'Mavic 3',
      category: 'other',
      totalCount: 2,
      availableCount: 1
    }
  ];

  async list(): Promise<Device[]> {
    // Return a copy to prevent external modifications
    return [...this.devices];
  }

  async getById(id: string): Promise<Device | null> {
    const device = this.devices.find(d => d.id === id);
    return device ? { ...device } : null;
  }

  async save(device: Device): Promise<Device> {
    const index = this.devices.findIndex(d => d.id === device.id);
    
    if (index >= 0) {
      // Update existing device
      this.devices[index] = { ...device };
      return { ...device };
    } else {
      // Add new device
      const newDevice = { ...device };
      this.devices.push(newDevice);
      return newDevice;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index >= 0) {
      this.devices.splice(index, 1);
    }
  }

  /**
   * Helper method for testing - resets to initial state
   */
  reset(): void {
    this.devices = [
      {
        id: '1',
        brand: 'Dell',
        model: 'XPS 15',
        category: 'laptop',
        totalCount: 5,
        availableCount: 3
      },
      {
        id: '2',
        brand: 'HP',
        model: 'EliteBook 840',
        category: 'laptop',
        totalCount: 8,
        availableCount: 5
      },
      {
        id: '3',
        brand: 'Lenovo',
        model: 'ThinkPad X1 Carbon',
        category: 'laptop',
        totalCount: 6,
        availableCount: 2
      },
      {
        id: '4',
        brand: 'Apple',
        model: 'MacBook Pro 14"',
        category: 'laptop',
        totalCount: 4,
        availableCount: 0
      },
      {
        id: '5',
        brand: 'Apple',
        model: 'iPad Air',
        category: 'tablet',
        totalCount: 10,
        availableCount: 7
      },
      {
        id: '6',
        brand: 'Samsung',
        model: 'Galaxy Tab S8',
        category: 'tablet',
        totalCount: 6,
        availableCount: 4
      },
      {
        id: '7',
        brand: 'Microsoft',
        model: 'Surface Pro 9',
        category: 'tablet',
        totalCount: 5,
        availableCount: 5
      },
      {
        id: '8',
        brand: 'Canon',
        model: 'EOS R6',
        category: 'camera',
        totalCount: 3,
        availableCount: 1
      },
      {
        id: '9',
        brand: 'Sony',
        model: 'Alpha A7 IV',
        category: 'camera',
        totalCount: 2,
        availableCount: 2
      },
      {
        id: '10',
        brand: 'Nikon',
        model: 'Z6 II',
        category: 'camera',
        totalCount: 2,
        availableCount: 0
      },
      {
        id: '11',
        brand: 'GoPro',
        model: 'Hero 11 Black',
        category: 'other',
        totalCount: 4,
        availableCount: 3
      },
      {
        id: '12',
        brand: 'DJI',
        model: 'Mavic 3',
        category: 'other',
        totalCount: 2,
        availableCount: 1
      }
    ];
  }
}
