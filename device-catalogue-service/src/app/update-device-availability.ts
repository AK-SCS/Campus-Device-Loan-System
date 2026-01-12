
import { Device, updateAvailability } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export async function updateDeviceAvailability(
  repo: DeviceRepo,
  deviceId: string,
  change: number
): Promise<Device> {
  const device = await repo.getById(deviceId);

  if (!device) {
    throw new Error(`Device not found: ${deviceId}`);
  }

  const updatedDevice = updateAvailability(device, change);

  return await repo.save(updatedDevice);
}
