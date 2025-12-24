import { DeviceRepository } from './deviceRepository';
import { DeviceModel } from '../domain/deviceModel';

export async function listDevices(deviceRepo: DeviceRepository): Promise<DeviceModel[]> {
    return await deviceRepo.listDeviceModels();
}
