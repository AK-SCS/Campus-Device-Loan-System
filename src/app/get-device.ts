import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export type GetDeviceDeps = {
  deviceRepo: DeviceRepo;
};

export async function getDevice(id: string, deps: GetDeviceDeps): Promise<Device | null> {
  return await deps.deviceRepo.get(id);
}
