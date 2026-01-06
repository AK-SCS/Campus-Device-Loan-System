/**
 * Azure Event Grid Publisher
 * Publishes loan events to Azure Event Grid
 */

import { EventGridPublisherClient, AzureKeyCredential } from '@azure/eventgrid';
import { EventPublisher, LoanEvent } from './fake-event-publisher.js';

export class EventGridPublisher implements EventPublisher {
  private client: EventGridPublisherClient<any>;
  private topicEndpoint: string;

  constructor(topicEndpoint: string, topicKey: string) {
    this.topicEndpoint = topicEndpoint;
    this.client = new EventGridPublisherClient(
      topicEndpoint,
      'EventGrid',
      new AzureKeyCredential(topicKey)
    );
  }

  /**
   * Publish a loan event to Azure Event Grid
   */
  async publish(event: LoanEvent): Promise<void> {
    try {
      const eventGridEvent = {
        id: `${event.type}-${event.data.loanId}-${Date.now()}`,
        subject: `loans/${event.data.loanId}`,
        dataVersion: '1.0',
        eventType: this.mapToEventGridType(event.type),
        data: event.data,
        eventTime: new Date()
      };

      await this.client.send([eventGridEvent]);
      console.log(`✅ Published ${event.type} event for loan ${event.data.loanId}`);
    } catch (error) {
      console.error(`❌ Error publishing ${event.type} event:`, error);
      throw new Error(`Failed to publish ${event.type} event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map internal event types to Event Grid event types
   */
  private mapToEventGridType(type: string): string {
    const mapping: Record<string, string> = {
      'device.reserved': 'Loan.Reserved',
      'device.collected': 'Loan.Collected',
      'device.returned': 'Loan.Returned',
      'device.reservation.cancelled': 'Loan.Cancelled'
    };
    return mapping[type] || 'Loan.Unknown';
  }

  // Legacy methods for backward compatibility
  async publishLoanReserved(loanId: string, userId: string, deviceId: string, deviceModel: string): Promise<void> {
    try {
      const event = {
        id: `loan-reserved-${loanId}-${Date.now()}`,
        subject: `loans/${loanId}`,
        dataVersion: '1.0',
        eventType: 'Loan.Reserved',
        data: {
          loanId,
          userId,
          deviceId,
          deviceModel,
          eventTime: new Date().toISOString()
        },
        eventTime: new Date()
      };

      await this.client.send([event]);
      console.log(`✅ Published Loan.Reserved event for loan ${loanId}`);
    } catch (error) {
      console.error('❌ Error publishing Loan.Reserved event:', error);
      throw new Error(`Failed to publish Loan.Reserved event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async publishLoanCollected(loanId: string, userId: string, deviceId: string): Promise<void> {
    try {
      const event = {
        id: `loan-collected-${loanId}-${Date.now()}`,
        subject: `loans/${loanId}`,
        dataVersion: '1.0',
        eventType: 'Loan.Collected',
        data: {
          loanId,
          userId,
          deviceId,
          eventTime: new Date().toISOString()
        },
        eventTime: new Date()
      };

      await this.client.send([event]);
      console.log(`✅ Published Loan.Collected event for loan ${loanId}`);
    } catch (error) {
      console.error('❌ Error publishing Loan.Collected event:', error);
      throw new Error(`Failed to publish Loan.Collected event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async publishLoanReturned(loanId: string, userId: string, deviceId: string): Promise<void> {
    try {
      const event = {
        id: `loan-returned-${loanId}-${Date.now()}`,
        subject: `loans/${loanId}`,
        dataVersion: '1.0',
        eventType: 'Loan.Returned',
        data: {
          loanId,
          userId,
          deviceId,
          eventTime: new Date().toISOString()
        },
        eventTime: new Date()
      };

      await this.client.send([event]);
      console.log(`✅ Published Loan.Returned event for loan ${loanId}`);
    } catch (error) {
      console.error('❌ Error publishing Loan.Returned event:', error);
      throw new Error(`Failed to publish Loan.Returned event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
