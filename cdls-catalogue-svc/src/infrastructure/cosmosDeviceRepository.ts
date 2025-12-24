import { CosmosClient, Container } from "@azure/cosmos";
import { DeviceRepository } from "../application/deviceRepository";
import { DeviceModel } from "../domain/deviceModel";

export class CosmosDeviceRepository implements DeviceRepository {
  private container: Container;

  constructor() {
    const endpoint = process.env.COSMOS_ENDPOINT!;
    const key = process.env.COSMOS_KEY!;
    const databaseId = process.env.COSMOS_DATABASE!;
    const containerId = process.env.COSMOS_CONTAINER!;

    const client = new CosmosClient({ endpoint, key });
    this.container = client.database(databaseId).container(containerId);
  }

  async listDeviceModels(): Promise<DeviceModel[]> {
    const query = {
      query: "SELECT * FROM c"
    };

    const { resources } = await this.container.items
      .query<DeviceModel>(query)
      .fetchAll();

    return resources;
  }
}
