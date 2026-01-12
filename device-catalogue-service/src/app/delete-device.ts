
import { DeviceRepo } from '../domain/device-repo.js';

export async function deleteDevice(
  repo: DeviceRepo,
  deviceId: string
): Promise<void> {
  const device = await repo.getById(deviceId);

  if (!device) {
    throw new Error(`Device not found: ${deviceId}`);
  }

  await repo.delete(deviceId);
}
