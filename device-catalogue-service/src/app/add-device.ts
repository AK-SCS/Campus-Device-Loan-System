/**
 * Add Device Use Case
 * Creates a new device in the catalogue
 */

import { Device, CreateDeviceInput, createDevice } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

/**
 * Add a new device to the catalogue
 * @param repo - Device repository
 * @param input - Device data
 * @returns Promise resolving to created device
 * @throws Error if validation fails
 */
export async function addDevice(
  repo: DeviceRepo,
  input: CreateDeviceInput
): Promise<Device> {
  // Use domain function to create and validate device
  const device = createDevice(input);

  // Save to repository
  return await repo.save(device);
}
