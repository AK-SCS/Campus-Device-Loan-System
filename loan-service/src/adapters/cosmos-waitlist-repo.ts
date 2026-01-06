/**
 * Cosmos DB Waitlist Repository Implementation
 */

import { CosmosClient, Container } from '@azure/cosmos';
import { Waitlist } from '../domain/waitlist.js';
import { WaitlistRepo } from '../domain/waitlist-repo.js';

export class CosmosWaitlistRepo implements WaitlistRepo {
  private container: Container;

  constructor(
    connectionString: string,
    databaseName: string,
    containerName: string = 'waitlist'
  ) {
    const client = new CosmosClient(connectionString);
    const database = client.database(databaseName);
    this.container = database.container(containerName);
    
    // Auto-create container if it doesn't exist
    this.initializeContainer(database, containerName);
  }

  private async initializeContainer(database: any, containerName: string): Promise<void> {
    try {
      await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: ['/id'] }
      });
      console.log(`Waitlist container '${containerName}' is ready`);
    } catch (error) {
      console.error('Error initializing waitlist container:', error);
    }
  }

  async save(waitlist: Waitlist): Promise<Waitlist> {
    const { resource } = await this.container.items.upsert({
      id: waitlist.id,
      ...waitlist
    });
    
    if (!resource) {
      throw new Error("Failed to save waitlist entry to Cosmos DB");
    }

    // Remove Cosmos DB metadata and return clean object
    const { _rid, _self, _etag, _attachments, _ts, ...cleanWaitlist } = resource as any;
    return cleanWaitlist as Waitlist;
  }

  async getByDeviceId(deviceId: string): Promise<Waitlist[]> {
    const query = 'SELECT * FROM c WHERE c.deviceId = @deviceId ORDER BY c.joinedAt ASC';
    const { resources } = await this.container.items
      .query({
        query,
        parameters: [{ name: '@deviceId', value: deviceId }]
      })
      .fetchAll();
    return resources;
  }

  async getByUserId(userId: string): Promise<Waitlist[]> {
    const query = 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.joinedAt DESC';
    const { resources } = await this.container.items
      .query({
        query,
        parameters: [{ name: '@userId', value: userId }]
      })
      .fetchAll();
    return resources;
  }

  async getUnnotifiedByDeviceId(deviceId: string): Promise<Waitlist[]> {
    const query = 'SELECT * FROM c WHERE c.deviceId = @deviceId AND c.notified = false ORDER BY c.joinedAt ASC';
    const { resources } = await this.container.items
      .query({
        query,
        parameters: [{ name: '@deviceId', value: deviceId }]
      })
      .fetchAll();
    return resources;
  }

  async delete(id: string): Promise<void> {
    await this.container.item(id, id).delete();
  }
}
