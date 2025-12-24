import { FakeDeviceRepository } from './infrastructure/fakeDeviceRepository';
import { CosmosDeviceRepository } from './infrastructure/cosmosDeviceRepository';
import { DeviceRepository } from './application/deviceRepository';

let deviceRepoInstance: DeviceRepository | null = null;

export function getDeviceRepo(): DeviceRepository {
  if (!deviceRepoInstance) {
    deviceRepoInstance = new CosmosDeviceRepository();
  }
  return deviceRepoInstance;
}
