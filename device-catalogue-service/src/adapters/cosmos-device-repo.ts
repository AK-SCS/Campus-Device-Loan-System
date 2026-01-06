import { CosmosClient, Container } from "@azure/cosmos";
import { DeviceRepo } from "../domain/device-repo.js";
import { Device } from "../domain/device.js";

export class CosmosDeviceRepo implements DeviceRepo {
  private container: Container;

  constructor(connectionString: string, databaseName: string = "campus-device-loan", containerName: string = "devices") {
    const client = new CosmosClient(connectionString);
    const database = client.database(databaseName);
    this.container = database.container(containerName);
  }

  async save(device: Device): Promise<Device> {
    try {
      // In Cosmos DB, we use the device as both the document and provide the id
      const { resource } = await this.container.items.upsert({
        id: device.id,
        ...device,
        _type: "device" // Add type identifier for multi-document containers
      });
      
      if (!resource) {
        throw new Error("Failed to save device to Cosmos DB");
      }

      // Remove Cosmos DB metadata and return clean device object
      const { _rid, _self, _etag, _attachments, _ts, _type, ...cleanDevice } = resource;
      return cleanDevice as Device;
    } catch (error) {
      console.error("Error saving device to Cosmos DB:", error);
      throw new Error(`Failed to save device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async list(): Promise<Device[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type",
          parameters: [{ name: "@type", value: "device" }]
        })
        .fetchAll();

      return resources.map(this.cleanDevice);
    } catch (error) {
      console.error("Error fetching devices from Cosmos DB:", error);
      throw new Error(`Failed to fetch devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCategory(category: string): Promise<Device[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type AND c.category = @category",
          parameters: [
            { name: "@type", value: "device" },
            { name: "@category", value: category }
          ]
        })
        .fetchAll();

      return resources.map(this.cleanDevice);
    } catch (error) {
      console.error("Error fetching devices by category from Cosmos DB:", error);
      throw new Error(`Failed to fetch devices by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByAvailability(isAvailable: boolean): Promise<Device[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type AND c.isAvailable = @isAvailable",
          parameters: [
            { name: "@type", value: "device" },
            { name: "@isAvailable", value: isAvailable }
          ]
        })
        .fetchAll();

      return resources.map(this.cleanDevice);
    } catch (error) {
      console.error("Error fetching devices by availability from Cosmos DB:", error);
      throw new Error(`Failed to fetch devices by availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByMinAvailability(minAvailability: number): Promise<Device[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type AND c.availableQuantity >= @minQuantity",
          parameters: [
            { name: "@type", value: "device" },
            { name: "@minQuantity", value: minAvailability }
          ]
        })
        .fetchAll();

      return resources.map(this.cleanDevice);
    } catch (error) {
      console.error("Error fetching devices by min availability from Cosmos DB:", error);
      throw new Error(`Failed to fetch devices by min availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: string): Promise<Device | null> {
    try {
      const { resource } = await this.container.item(id, id).read();
      
      if (!resource || resource._type !== "device") {
        return null;
      }

      return this.cleanDevice(resource);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      console.error("Error fetching device by id from Cosmos DB:", error);
      throw new Error(`Failed to fetch device by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.container.item(id, id).delete();
    } catch (error: any) {
      if (error.code === 404) {
        // Device doesn't exist, which is fine for delete
        return;
      }
      console.error("Error deleting device from Cosmos DB:", error);
      throw new Error(`Failed to delete device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanDevice(resource: any): Device {
    const { _rid, _self, _etag, _attachments, _ts, _type, ...device } = resource;
    return device as Device;
  }
}