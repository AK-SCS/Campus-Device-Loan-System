import { getDeviceRepo } from '../config/appServices.js';
import { createDevice } from '../domain/device.js';
import { testDevices } from './test-data.js';

async function seed() {
  console.log('Starting database seed...');
  const repo = getDeviceRepo();

  for (const deviceData of testDevices) {
    const device = createDevice(deviceData);
    await repo.create(device);
    console.log(`Created device: ${device.id} - ${device.brand} ${device.model}`);
  }

  console.log('Seed completed successfully!');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
