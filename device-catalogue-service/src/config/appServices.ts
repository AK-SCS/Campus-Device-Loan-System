
import { DeviceRepo } from '../domain/device-repo.js';
import { FakeDeviceRepo } from '../infra/fake-device-repo.js';
import { CosmosDeviceRepo } from '../adapters/cosmos-device-repo.js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production' || process.env.USE_AZURE === 'true') {
  dotenv.config({ path: '.env.azure' });
} else {
  dotenv.config();
}

let deviceRepoInstance: DeviceRepo | null = null;

export function getDeviceRepo(): DeviceRepo {
  if (!deviceRepoInstance) {
    const useAzure = process.env.NODE_ENV === 'production' || process.env.USE_AZURE === 'true';

    if (useAzure && process.env.COSMOS_CONNECTION_STRING) {
      console.log('Using Azure Cosmos DB for device repository');
      deviceRepoInstance = new CosmosDeviceRepo(
        process.env.COSMOS_CONNECTION_STRING,
        process.env.COSMOS_DATABASE_NAME,
        process.env.COSMOS_DEVICES_CONTAINER
      );
    } else {
      console.log('Using fake device repository for local development');
      deviceRepoInstance = new FakeDeviceRepo();
    }
  }
  return deviceRepoInstance;
}

export function resetServices(): void {
  deviceRepoInstance = null;
}
