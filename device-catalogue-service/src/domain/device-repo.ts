/**
 * Device Repository Port (Interface)
 * Pure domain interface - defines what the repository should do
 * No implementation details - that belongs in infrastructure layer
 */

import { Device } from './device.js';

export interface DeviceRepo {
  /**
   * List all devices
   * @returns Promise resolving to array of all devices
   */
  list(): Promise<Device[]>;

  /**
   * Get a single device by ID
   * @param id - The device ID
   * @returns Promise resolving to device or null if not found
   */
  getById(id: string): Promise<Device | null>;

  /**
   * Save a device (create or update)
   * @param device - The device to save
   * @returns Promise resolving to the saved device
   */
  save(device: Device): Promise<Device>;

  /**
   * Delete a device by ID
   * @param id - The device ID to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;
}
