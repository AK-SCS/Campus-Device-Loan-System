/**
 * Application Services Configuration
 * 
 * Dependency injection container for the Loan Service.
 * Uses singleton pattern to ensure consistent instances across function invocations.
 * 
 * In local development, uses fake implementations.
 * In production, will switch to real implementations based on environment variables.
 */

/**
 * Application Services Configuration
 * 
 * Dependency injection container for the Loan Service.
 * Uses singleton pattern to ensure consistent instances across function invocations.
 * 
 * In local development, uses fake implementations.
 * In production, will switch to real implementations based on environment variables.
 */

import { LoanRepo } from '../domain/loan-repo';
import { FakeLoanRepo } from '../infra/fake-loan-repo';
import { CosmosLoanRepo } from '../adapters/cosmos-loan-repo.js';
import { WaitlistRepo } from '../domain/waitlist-repo.js';
import { FakeWaitlistRepo } from '../infra/fake-waitlist-repo.js';
import { CosmosWaitlistRepo } from '../adapters/cosmos-waitlist-repo.js';
import { NotificationRepo } from '../domain/notification-repo.js';
import { FakeNotificationRepo } from '../infra/fake-notification-repo.js';
import { CosmosNotificationRepo } from '../adapters/cosmos-notification-repo.js';
import { EventPublisher, FakeEventPublisher } from '../infra/fake-event-publisher';
import { EventGridPublisher } from '../infra/event-grid-publisher.js';
import { DeviceClient, FakeDeviceClient } from '../infra/fake-device-client';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production' || process.env.USE_AZURE === 'true') {
  dotenv.config({ path: '.env.azure' });
} else {
  dotenv.config();
}

// Singleton instances
let loanRepoInstance: LoanRepo | null = null;
let waitlistRepoInstance: WaitlistRepo | null = null;
let notificationRepoInstance: NotificationRepo | null = null;
let eventPublisherInstance: EventPublisher | null = null;
let deviceClientInstance: DeviceClient | null = null;

/**
 * Get or create the loan repository instance
 */
export function getLoanRepo(): LoanRepo {
  if (!loanRepoInstance) {
    const useAzure = process.env.NODE_ENV === 'production' || process.env.USE_AZURE === 'true';
    
    if (useAzure && process.env.COSMOS_CONNECTION_STRING) {
      console.log('Using Azure Cosmos DB for loan repository');
      loanRepoInstance = new CosmosLoanRepo(
        process.env.COSMOS_CONNECTION_STRING,
        process.env.COSMOS_DATABASE_NAME,
        process.env.COSMOS_LOANS_CONTAINER
      );
    } else {
      console.log('Using fake loan repository for local development');
      loanRepoInstance = new FakeLoanRepo();
    }
  }
  return loanRepoInstance;
}

/**
 * Get or create the waitlist repository instance
 */
export function getWaitlistRepo(): WaitlistRepo {
  if (!waitlistRepoInstance) {
    const useAzure = process.env.NODE_ENV === 'production' || process.env.USE_AZURE === 'true';
    
    if (useAzure && process.env.COSMOS_CONNECTION_STRING) {
      console.log('Using Azure Cosmos DB for waitlist repository');
      waitlistRepoInstance = new CosmosWaitlistRepo(
        process.env.COSMOS_CONNECTION_STRING,
        process.env.COSMOS_DATABASE_NAME,
        'waitlist'
      );
    } else {
      console.log('Using fake waitlist repository for local development');
      waitlistRepoInstance = new FakeWaitlistRepo();
    }
  }
  return waitlistRepoInstance;
}

/**
 * Get or create the event publisher instance
 */
export function getEventPublisher(): EventPublisher {
  if (!eventPublisherInstance) {
    const useEventGrid = process.env.USE_EVENT_GRID === 'true' && process.env.EVENT_GRID_TOPIC_ENDPOINT && process.env.EVENT_GRID_TOPIC_KEY;
    
    if (useEventGrid) {
      console.log('Using Azure Event Grid for event publishing');
      eventPublisherInstance = new EventGridPublisher(
        process.env.EVENT_GRID_TOPIC_ENDPOINT as string,
        process.env.EVENT_GRID_TOPIC_KEY as string
      );
    } else {
      console.log('Using fake event publisher for local development');
      eventPublisherInstance = new FakeEventPublisher();
    }
  }
  return eventPublisherInstance;
}

/**
 * Get or create the notification repository instance
 */
export function getNotificationRepo(): NotificationRepo {
  if (!notificationRepoInstance) {
    const useAzure = process.env.NODE_ENV === 'production' || process.env.USE_AZURE === 'true';
    
    if (useAzure && process.env.COSMOS_CONNECTION_STRING) {
      console.log('Using Azure Cosmos DB for notification repository (email service database)');
      // Use email service Cosmos DB account for notifications
      const emailCosmosConnection = 'AccountEndpoint=https://campus-email-notification-cosmos.documents.azure.com:443/;AccountKey=GvoGJDj8Kh3JC3MnicSyykgf7mVZoMWyoaNso7mqMbr1U0dwys7fpN6aUxMXl0AaHY0tOA0cwHxXACDbPsh4IA==;';
      notificationRepoInstance = new CosmosNotificationRepo(
        emailCosmosConnection,
        'notifications-db',
        'notifications'
      );
    } else {
      console.log('Using fake notification repository for local development');
      notificationRepoInstance = new FakeNotificationRepo();
    }
  }
  return notificationRepoInstance;
}

/**
 * Get or create the device client instance
 */
export function getDeviceClient(): DeviceClient {
  if (!deviceClientInstance) {
    // Use environment variable for base URL, default to localhost
    const baseUrl = process.env.DEVICE_CATALOGUE_BASE_URL || 'http://localhost:7071/api';
    const functionKey = process.env.DEVICE_CATALOGUE_FUNCTION_KEY;
    
    if (functionKey) {
      console.log('Using Azure Function Key for device catalogue authentication');
    }
    
    deviceClientInstance = new FakeDeviceClient(baseUrl, functionKey);
  }
  return deviceClientInstance;
}

/**
 * Reset all singleton instances (for testing)
 */
export function resetServices(): void {
  loanRepoInstance = null;
  waitlistRepoInstance = null;
  notificationRepoInstance = null;
  eventPublisherInstance = null;
  deviceClientInstance = null;
}
