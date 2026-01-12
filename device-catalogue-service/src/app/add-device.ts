
import { Device, CreateDeviceInput, createDevice } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export async function addDevice(
  repo: DeviceRepo,
  input: CreateDeviceInput
): Promise<Device> {

  const device = createDevice(input);

  return await repo.save(device);
}
