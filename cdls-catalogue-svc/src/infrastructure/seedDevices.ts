import { CosmosClient } from "@azure/cosmos";
import { DeviceModel } from "../domain/deviceModel";

const devices: DeviceModel[] = [
  // Laptops
  { id: "d1", brand: "Dell", model: "Latitude 5420", category: "Laptop", available: 5 },
  { id: "d2", brand: "HP", model: "ProBook 450 G8", category: "Laptop", available: 3 },
  { id: "d3", brand: "Lenovo", model: "ThinkPad E14", category: "Laptop", available: 4 },
  { id: "d4", brand: "Apple", model: "MacBook Air M2", category: "Laptop", available: 2 },
  
  // Tablets
  { id: "d5", brand: "Apple", model: "iPad Air", category: "Tablet", available: 6 },
  { id: "d6", brand: "Samsung", model: "Galaxy Tab S8", category: "Tablet", available: 4 },
  { id: "d7", brand: "Microsoft", model: "Surface Go 3", category: "Tablet", available: 3 },
  
  // Cameras
  { id: "d8", brand: "Canon", model: "EOS 250D", category: "Camera", available: 2 },
  { id: "d9", brand: "Nikon", model: "D3500", category: "Camera", available: 2 },
  { id: "d10", brand: "Sony", model: "Alpha A6400", category: "Camera", available: 1 },
  
  // Accessories
  { id: "d11", brand: "Logitech", model: "MX Master 3", category: "Mouse", available: 10 },
  { id: "d12", brand: "Dell", model: "UltraSharp U2720Q", category: "Monitor", available: 8 },
  { id: "d13", brand: "Jabra", model: "Evolve2 65", category: "Headset", available: 12 },
  { id: "d14", brand: "Anker", model: "PowerCore 20000", category: "Power Bank", available: 15 }
];

async function seed() {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const database = process.env.COSMOS_DATABASE;
  const container = process.env.COSMOS_CONTAINER;

  if (!endpoint || !key || !database || !container) {
    console.error("Missing required environment variables:");
    console.error("COSMOS_ENDPOINT:", endpoint ? "✓" : "✗");
    console.error("COSMOS_KEY:", key ? "✓" : "✗");
    console.error("COSMOS_DATABASE:", database ? "✓" : "✗");
    console.error("COSMOS_CONTAINER:", container ? "✓" : "✗");
    process.exit(1);
  }

  console.log(`Connecting to Cosmos DB: ${endpoint}`);
  console.log(`Database: ${database}, Container: ${container}`);

  const client = new CosmosClient({ endpoint, key });
  const cosmosContainer = client.database(database).container(container);

  console.log(`Seeding ${devices.length} devices...`);

  for (const device of devices) {
    await cosmosContainer.items.upsert(device);
    console.log(`  ✓ ${device.brand} ${device.model} (${device.available} available)`);
  }

  console.log("\n✅ All devices seeded successfully!");
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
