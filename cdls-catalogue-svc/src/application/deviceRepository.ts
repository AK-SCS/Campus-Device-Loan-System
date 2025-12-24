import { DeviceModel } from '../domain/deviceModel';

export interface DeviceRepository {
    listDeviceModels(): Promise<DeviceModel[]>;
}
