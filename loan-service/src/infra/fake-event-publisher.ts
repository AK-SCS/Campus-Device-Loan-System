/**
 * Fake Event Publisher
 * 
 * Logs events to console for local development.
 * In production, this will be replaced with EventGridPublisher.
 */

export type LoanEventType = 
  | 'device.reserved'
  | 'device.collected'
  | 'device.returned'
  | 'device.reservation.cancelled';

export interface LoanEvent {
  type: LoanEventType;
  data: {
    loanId: string;
    userId: string;
    deviceId: string;
    deviceModel: string;
    timestamp: string | Date;
    dueDate?: string | Date;
    cancelledAt?: string | Date;
    reservedAt?: string | Date;
    collectedAt?: string | Date;
    returnedAt?: string | Date;
    [key: string]: any; // Allow additional properties
  };
}

export interface EventPublisher {
  publish(event: LoanEvent): Promise<void>;
}

export class FakeEventPublisher implements EventPublisher {
  private publishedEvents: LoanEvent[] = [];

  async publish(event: LoanEvent): Promise<void> {
    console.log('========================================');
    console.log('📢 EVENT PUBLISHED:', event.type);
    console.log('========================================');
    console.log('Event Data:', JSON.stringify(event.data, null, 2));
    console.log('========================================');
    
    // Store for testing purposes
    this.publishedEvents.push(event);
  }

  /**
   * Helper method for testing - get all published events
   */
  getPublishedEvents(): LoanEvent[] {
    return [...this.publishedEvents];
  }

  /**
   * Helper method for testing - clear published events
   */
  reset(): void {
    this.publishedEvents = [];
  }
}
