/**
 * Cosmos DB Notification Repository Implementation
 */

import { CosmosClient, Container, Database } from '@azure/cosmos';
import { Notification } from '../domain/notification.js';
import { NotificationRepo } from '../domain/notification-repo.js';

export class CosmosNotificationRepo implements NotificationRepo {
  private container: Container;
  private containerReady: Promise<void>;

  constructor(
    connectionString: string,
    databaseName: string,
    containerName: string = 'notifications'
  ) {
    const client = new CosmosClient(connectionString);
    const database = client.database(databaseName);
    this.container = database.container(containerName);
    
    // Auto-create container if it doesn't exist
    this.containerReady = this.initializeContainer(database, containerName);
  }

  private async initializeContainer(database: Database, containerName: string): Promise<void> {
    try {
      await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: ['/id'] }
      });
      console.log(`Notification container '${containerName}' is ready`);
    } catch (error) {
      console.error('Error initializing notification container:', error);
    }
  }

  async save(notification: Notification): Promise<Notification> {
    await this.containerReady; // Ensure container exists
    const { resource } = await this.container.items.upsert({
      id: notification.id,
      ...notification
    });
    
    if (!resource) {
      throw new Error("Failed to save notification to Cosmos DB");
    }

    // Remove Cosmos DB metadata
    const { _rid, _self, _etag, _attachments, _ts, ...cleanNotification } = resource as any;
    return cleanNotification as Notification;
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    await this.containerReady; // Ensure container exists
    const query = 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC';
    const { resources } = await this.container.items
      .query({
        query,
        parameters: [{ name: '@userId', value: userId }]
      })
      .fetchAll();
    return resources;
  }

  async markAsRead(id: string): Promise<void> {
    await this.containerReady; // Ensure container exists
    const { resource } = await this.container.item(id, id).read();
    if (resource) {
      resource.read = true;
      await this.container.item(id, id).replace(resource);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getByUserId(userId);
    for (const notification of notifications) {
      if (!notification.read) {
        await this.markAsRead(notification.id);
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.container.item(id, id).delete();
  }
}
