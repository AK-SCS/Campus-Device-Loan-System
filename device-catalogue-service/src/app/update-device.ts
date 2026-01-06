/**
 * Update Device Use Case
 * Updates an existing device's details
 */

import { Device, CreateDeviceInput, createDevice } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

/**
 * Update an existing device
 * @param repo - Device repository
 * @param deviceId - ID of the device to update
 * @param input - Updated device data
 * @returns Promise resolving to updated device
 * @throws Error if device not found or validation fails
 */
export async function updateDevice(
  repo: DeviceRepo,
  deviceId: string,
  input: Partial<CreateDeviceInput>
): Promise<Device> {
  const existingDevice = await repo.getById(deviceId);

  if (!existingDevice) {
    throw new Error(`Device not found: ${deviceId}`);
  }

  // Merge existing data with updates
  const updatedInput: CreateDeviceInput = {
    model: input.model ?? existingDevice.model,
    brand: input.brand ?? existingDevice.brand,
    category: input.category ?? existingDevice.category,
    availableCount: input.availableCount ?? existingDevice.availableCount,
    totalCount: input.totalCount ?? existingDevice.totalCount
  };

  // Validate and create updated device
  const updatedDevice = createDevice(updatedInput);

  // Preserve the existing ID instead of generating a new one
  const deviceToSave = { ...updatedDevice, id: deviceId };

  // Save to repository
  return await repo.save(deviceToSave);
}
