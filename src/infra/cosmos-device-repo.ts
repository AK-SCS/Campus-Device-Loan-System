import { CosmosClient, Database, Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { DeviceRepo } from '../domain/device-repo.js';
import { Device } from '../domain/device.js';

type CosmosDeviceDocument = {
  id: string;
  brand: string;
  model: string;
  category: string;
  totalCount: number;
  availableCount: number;
};

export type CosmosDeviceRepoOptions = {
  endpoint: string;
  database: string;
  container: string;
  key?: string;
};

export class CosmosDeviceRepo implements DeviceRepo {
  private client: CosmosClient;
  private database: Database;
  private container: Container;

  constructor(options: CosmosDeviceRepoOptions) {
    if (options.key) {
      this.client = new CosmosClient({
        endpoint: options.endpoint,
        key: options.key,
      });
    } else {
      this.client = new CosmosClient({
        endpoint: options.endpoint,
        aadCredentials: new DefaultAzureCredential(),
      });
    }
    
    this.database = this.client.database(options.database);
    this.container = this.database.container(options.container);
  }

  async create(device: Device): Promise<Device> {
    const doc: CosmosDeviceDocument = {
      id: device.id,
      brand: device.brand,
      model: device.model,
      category: device.category,
      totalCount: device.totalCount,
      availableCount: device.availableCount,
    };

    const { resource } = await this.container.items.create(doc);
    return this.mapToDomain(resource!);
  }

  async get(id: string): Promise<Device | null> {
    try {
      const { resource } = await this.container.item(id, id).read<CosmosDeviceDocument>();
      return resource ? this.mapToDomain(resource) : null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async list(): Promise<Device[]> {
    const { resources } = await this.container.items
      .readAll<CosmosDeviceDocument>()
      .fetchAll();
    return resources.map((doc) => this.mapToDomain(doc));
  }

  async update(device: Device): Promise<Device> {
    const doc: CosmosDeviceDocument = {
      id: device.id,
      brand: device.brand,
      model: device.model,
      category: device.category,
      totalCount: device.totalCount,
      availableCount: device.availableCount,
    };

    const { resource } = await this.container.item(device.id, device.id).replace(doc);
    return this.mapToDomain(resource!);
  }

  private mapToDomain(doc: CosmosDeviceDocument): Device {
    return {
      id: doc.id,
      brand: doc.brand,
      model: doc.model,
      category: doc.category,
      totalCount: doc.totalCount,
      availableCount: doc.availableCount,
    };
  }
}
