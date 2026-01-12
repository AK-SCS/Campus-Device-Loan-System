
import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export interface GetDeviceDeps {
  deviceRepo: DeviceRepo;
}

export interface GetDeviceInput {
  deviceId: string;
}

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
