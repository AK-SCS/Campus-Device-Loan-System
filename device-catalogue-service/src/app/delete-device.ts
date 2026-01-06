/**
 * Delete Device Use Case
 * Removes a device from the catalogue
 */

import { DeviceRepo } from '../domain/device-repo.js';

/**
 * Delete a device from the catalogue
 * @param repo - Device repository
 * @param deviceId - ID of the device to delete
 * @returns Promise resolving when deletion is complete
 * @throws Error if device not found
 */
export async function deleteDevice(
  repo: DeviceRepo,
  deviceId: string
): Promise<void> {
  const device = await repo.getById(deviceId);

  if (!device) {
    throw new Error(`Device not found: ${deviceId}`);
  }

  // Note: In a real system, you might want to check if device has active loans
  // before allowing deletion

  await repo.delete(deviceId);
}
