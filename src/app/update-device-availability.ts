import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export type UpdateDeviceAvailabilityDeps = {
  deviceRepo: DeviceRepo;
};

export type UpdateDeviceAvailabilityParams = {
  deviceId: string;
  availableCount: number;
};

export async function updateDeviceAvailability(
  params: UpdateDeviceAvailabilityParams,
  deps: UpdateDeviceAvailabilityDeps
): Promise<Device | null> {
  const device = await deps.deviceRepo.get(params.deviceId);
  
  if (!device) {
    return null;
  }

  if (params.availableCount < 0 || params.availableCount > device.totalCount) {
    throw new Error('Available count must be between 0 and total count');
  }

  device.availableCount = params.availableCount;
  
  return await deps.deviceRepo.update(device);
}
