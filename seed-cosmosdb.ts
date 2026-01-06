/**
 * Seed Azure Cosmos DB with initial device data
 * Run this script to populate the devices container with test data
 */

import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

// Load Azure environment variables
dotenv.config({ path: '.env.azure' });

const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DATABASE_NAME || 'devices-db';
const containerName = process.env.COSMOS_CONTAINER_NAME || 'devices';

if (!connectionString) {
  console.error('❌ COSMOS_CONNECTION_STRING not found in environment variables');
  process.exit(1);
}

// Sample device data - matches the Device domain model
const sampleDevices = [
  {
    id: '1',
    brand: 'Apple',
    model: 'MacBook Pro 14"',
    category: 'laptop',
    totalCount: 5,
    availableCount: 5,
    _type: 'device'
  },
  {
    id: '2',
    brand: 'Apple',
    model: 'iPad Pro 12.9"',
    category: 'tablet',
    totalCount: 3,
    availableCount: 3,
    _type: 'device'
  },
  {
    id: '3',
    brand: 'Dell',
    model: 'XPS 15',
    category: 'laptop',
    totalCount: 4,
    availableCount: 4,
    _type: 'device'
  },
  {
    id: '4',
    brand: 'Microsoft',
    model: 'Surface Pro 9',
    category: 'tablet',
    totalCount: 3,
    availableCount: 0,
    _type: 'device'
  },
  {
    id: '5',
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon',
    category: 'laptop',
    totalCount: 6,
    availableCount: 6,
    _type: 'device'
  },
  {
    id: '6',
    brand: 'Samsung',
    model: 'Galaxy Tab S9',
    category: 'tablet',
    totalCount: 2,
    availableCount: 2,
    _type: 'device'
  },
  {
    id: '7',
    brand: 'HP',
    model: 'Spectre x360',
    category: 'laptop',
    totalCount: 3,
    availableCount: 0,
    _type: 'device'
  },
  {
    id: '8',
    brand: 'Lenovo',
    model: 'Tab P12',
    category: 'tablet',
    totalCount: 4,
    availableCount: 4,
    _type: 'device'
  },
  {
    id: '9',
    brand: 'ASUS',
    model: 'ROG Zephyrus',
    category: 'laptop',
    totalCount: 2,
    availableCount: 2,
    _type: 'device'
  },
  {
    id: '10',
    brand: 'Microsoft',
    model: 'Surface Laptop 5',
    category: 'laptop',
    totalCount: 5,
    availableCount: 5,
    _type: 'device'
  },
  {
    id: '11',
    brand: 'Apple',
    model: 'iPad Air',
    category: 'tablet',
    totalCount: 3,
    availableCount: 0,
    _type: 'device'
  },
  {
    id: '12',
    brand: 'Acer',
    model: 'Swift 3',
    category: 'laptop',
    totalCount: 4,
    availableCount: 4,
    _type: 'device'
  }
];

async function seedDevices() {
  try {
    console.log('🌱 Seeding Azure Cosmos DB with device data...');
    console.log(`Connection: ${databaseName}/${containerName}\n`);
    
    const client = new CosmosClient(connectionString as string);
    const database = client.database(databaseName as string);
    const container = database.container(containerName as string);
    
    // Clear existing data first
    console.log('🗑️  Clearing existing devices...');
    const { resources: existing } = await container.items.readAll().fetchAll();
    for (const item of existing) {
      await container.item(item.id as string, item.id as string).delete();
    }
    console.log(`✅ Cleared ${existing.length} existing devices\n`);
    
    // Insert sample devices
    console.log('📥 Inserting sample devices...');
    for (const device of sampleDevices) {
      await container.items.create(device);
      console.log(`   ✓ ${device.brand} ${device.model} (${device.category}) - ${device.availableCount}/${device.totalCount} available`);
    }
    
    console.log(`\n🎉 Successfully seeded ${sampleDevices.length} devices!`);
    
    // Verify the data
    const { resources: allDevices } = await container.items.readAll().fetchAll();
    console.log(`\n✅ Verification: ${allDevices.length} devices now in Cosmos DB`);
    
  } catch (error) {
    console.error('❌ Error seeding Cosmos DB:', error);
    throw error;
  }
}

// Run the seed
seedDevices()
  .then(() => {
    console.log('\n✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  });
