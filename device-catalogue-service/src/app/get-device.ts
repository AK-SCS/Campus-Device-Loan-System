/**
 * Get Device Use Case
 * Application layer - orchestrates domain logic
 */

import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export interface GetDeviceDeps {
  deviceRepo: DeviceRepo;
}

export interface GetDeviceInput {
  deviceId: string;
}

/**
 * Gets a single device by ID
 * @param deps - Dependencies (repository)
 * @param input - Input containing device ID
 * @returns Promise resolving to device or null if not found
 */
export async function getDevice(
  deps: GetDeviceDeps,
  input: GetDeviceInput
): Promise<Device | null> {
  if (!input.deviceId || input.deviceId.trim().length === 0) {
    throw new Error('Device ID is required');
  }

  const device = await deps.deviceRepo.getById(input.deviceId);
  return device;
}
