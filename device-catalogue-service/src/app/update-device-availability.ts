/**
 * Update Device Availability Use Case
 * Changes the available quantity for a device
 */

import { Device, updateAvailability } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

/**
 * Update device availability
 * @param repo - Device repository
 * @param deviceId - ID of the device to update
 * @param change - The change in availability (positive to add, negative to reduce)
 * @returns Promise resolving to updated device
 * @throws Error if device not found or availability would be negative
 */
export async function updateDeviceAvailability(
  repo: DeviceRepo,
  deviceId: string,
  change: number
): Promise<Device> {
  const device = await repo.getById(deviceId);

  if (!device) {
    throw new Error(`Device not found: ${deviceId}`);
  }

  // Use domain function to update availability
  const updatedDevice = updateAvailability(device, change);

  // Save the updated device
  return await repo.save(updatedDevice);
}
