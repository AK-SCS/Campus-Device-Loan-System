
import { Device, CreateDeviceInput, createDevice } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export async function updateDevice(
  repo: DeviceRepo,
  deviceId: string,
  input: Partial<CreateDeviceInput>
): Promise<Device> {
  const existingDevice = await repo.getById(deviceId);

  if (!existingDevice) {
    throw new Error(`Device not found: ${deviceId}`);
  }

  const updatedInput: CreateDeviceInput = {
    model: input.model ?? existingDevice.model,
    brand: input.brand ?? existingDevice.brand,
    category: input.category ?? existingDevice.category,
    availableCount: input.availableCount ?? existingDevice.availableCount,
    totalCount: input.totalCount ?? existingDevice.totalCount
  };

  const updatedDevice = createDevice(updatedInput);

  const deviceToSave = { ...updatedDevice, id: deviceId };

  return await repo.save(deviceToSave);
}
