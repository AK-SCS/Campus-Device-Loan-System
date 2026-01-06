/**
 * List Devices Use Case
 * Application layer - orchestrates domain logic
 */

import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export interface ListDevicesDeps {
  deviceRepo: DeviceRepo;
}

/**
 * Lists all devices in the catalogue
 * @param deps - Dependencies (repository)
 * @returns Promise resolving to array of all devices
 */
export async function listDevices(deps: ListDevicesDeps): Promise<Device[]> {
  const devices = await deps.deviceRepo.list();
  return devices;
}
