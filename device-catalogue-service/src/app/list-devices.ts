
import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export interface ListDevicesDeps {
  deviceRepo: DeviceRepo;
}

export async function listDevices(deps: ListDevicesDeps): Promise<Device[]> {
  const devices = await deps.deviceRepo.list();
  return devices;
}
