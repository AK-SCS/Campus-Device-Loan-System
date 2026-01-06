import { CosmosDeviceRepo } from '../infra/cosmos-device-repo.js';
import { DeviceRepo } from '../domain/device-repo.js';

let deviceRepoInstance: DeviceRepo | null = null;

export function getDeviceRepo(): DeviceRepo {
  if (!deviceRepoInstance) {
    const cosmosKey = process.env.COSMOS_KEY;
    if (!cosmosKey) {
      throw new Error('COSMOS_KEY environment variable is required');
    }

    deviceRepoInstance = new CosmosDeviceRepo({
      endpoint: 'https://device-loan-dev-cdls01-cosmos.documents.azure.com:443/',
      database: 'devices-db',
      container: 'devices',
      key: cosmosKey,
    });
  }
  return deviceRepoInstance;
}
