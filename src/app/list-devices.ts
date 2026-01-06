import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export type ListDevicesDeps = {
  deviceRepo: DeviceRepo;
};

export async function listDevices(deps: ListDevicesDeps): Promise<Device[]> {
  return await deps.deviceRepo.list();
}
