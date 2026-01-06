/**
 * Azure Cosmos DB Setup Script
 * Creates the database and containers needed for the application
 */

import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

// Load Azure environment variables
dotenv.config({ path: '.env.azure' });

const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DATABASE_NAME || 'campus-device-loan';

if (!connectionString) {
  console.error('❌ COSMOS_CONNECTION_STRING not found in environment variables');
  process.exit(1);
}

async function setupCosmosDB() {
  try {
    console.log('🚀 Setting up Azure Cosmos DB...');
    
    const client = new CosmosClient(connectionString!);
    
    // Create database
    console.log(`📦 Creating database: ${databaseName}`);
    const { database } = await client.databases.createIfNotExists({
      id: databaseName
    });
    console.log('✅ Database created/verified');
    
    // Create devices container
    console.log('📄 Creating devices container...');
    const { container: devicesContainer } = await database.containers.createIfNotExists({
      id: 'devices',
      partitionKey: { paths: ['/id'] }
    });
    console.log('✅ Devices container created/verified');
    
    // Create loans container
    console.log('📄 Creating loans container...');
    const { container: loansContainer } = await database.containers.createIfNotExists({
      id: 'loans',
      partitionKey: { paths: ['/id'] }
    });
    console.log('✅ Loans container created/verified');
    
    console.log('\n🎉 Cosmos DB setup complete!');
    console.log(`Database: ${databaseName}`);
    console.log('Containers: devices, loans');
    
  } catch (error) {
    console.error('❌ Error setting up Cosmos DB:', error);
    throw error;
  }
}

// Run the setup
setupCosmosDB()
  .then(() => {
    console.log('\n✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });