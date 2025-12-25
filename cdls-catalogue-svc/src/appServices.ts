import { FakeDeviceRepository } from './infrastructure/fakeDeviceRepository';
import { CosmosDeviceRepository } from './infrastructure/cosmosDeviceRepository';
import { DeviceRepository } from './application/deviceRepository';

let deviceRepoInstance: DeviceRepository | null = null;

export function getDeviceRepo(): DeviceRepository {
  if (!deviceRepoInstance) {
    // Use FakeDeviceRepository if Cosmos DB is not configured (for local dev/testing)
    const useFake = !process.env.COSMOS_ENDPOINT || 
                    process.env.COSMOS_ENDPOINT === 'https://fake.documents.azure.com:443/';
    
    if (useFake) {
      console.log('Using FakeDeviceRepository (Cosmos DB not configured)');
      deviceRepoInstance = new FakeDeviceRepository();
    } else {
      console.log('Using CosmosDeviceRepository');
      deviceRepoInstance = new CosmosDeviceRepository();
    }
  }
  return deviceRepoInstance;
}
