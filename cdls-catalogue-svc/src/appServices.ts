import { FakeDeviceRepository } from './infrastructure/fakeDeviceRepository';
import { DeviceRepository } from './application/deviceRepository';

export const deviceRepo: DeviceRepository = new FakeDeviceRepository();
