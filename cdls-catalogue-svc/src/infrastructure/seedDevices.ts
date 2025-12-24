import { CosmosClient } from "@azure/cosmos";
import { DeviceModel } from "../domain/deviceModel";

const devices: DeviceModel[] = [
  { id: "d1", brand: "Dell", model: "Latitude 5420", category: "Laptop", available: 5 },
  { id: "d2", brand: "Apple", model: "iPad Air", category: "Tablet", available: 2 },
  { id: "d3", brand: "Canon", model: "EOS 250D", category: "Camera", available: 1 }
];

async function seed() {
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT!,
    key: process.env.COSMOS_KEY!
  });

  const container = client
    .database(process.env.COSMOS_DATABASE!)
    .container(process.env.COSMOS_CONTAINER!);

  for (const device of devices) {
    await container.items.upsert(device);
  }

  console.log("Devices seeded successfully");
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
