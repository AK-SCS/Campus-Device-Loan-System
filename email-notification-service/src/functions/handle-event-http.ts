/**
 * Handle Event HTTP Trigger
 * 
 * Receives loan events via HTTP POST and sends appropriate email notifications.
 * In production, this endpoint will be called by Azure Event Grid subscriptions.
 * For local testing, events can be sent via HTTP POST requests.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { sendNotification, type LoanEvent, type LoanEventType } from '../app/send-notification';
import { getEmailSender } from '../config/appServices';
import { trackEvent, trackMetric } from '../infrastructure/telemetry.js';

/**
 * HTTP trigger function to handle loan events
 * 
 * POST /api/handle-event
 * 
 * Request body should match LoanEvent structure:
 * {
 *   "type": "device.reserved" | "device.collected" | "device.returned",
 *   "data": {
 *     "loanId": "string",
 *     "userId": "string",
 *     "deviceId": "string",
 *     "deviceModel": "string",
 *     "timestamp": "ISO8601 date string",
 *     "dueDate": "ISO8601 date string", // required for reserved and collected
 *     "reservedAt": "ISO8601 date string", // required for reserved
 *     "collectedAt": "ISO8601 date string", // required for collected
 *     "returnedAt": "ISO8601 date string" // required for returned
 *   }
 * }
 * 
 * Returns:
 * - 200: Email sent successfully
 * - 400: Invalid event data
 * - 500: Internal server error
 */
export async function handleEventHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing event request');

  try {
    // Parse request body as JSON
    const body = await request.text();
    
    if (!body) {
      context.warn('Empty request body received');
      return {
        status: 400,
        jsonBody: {
          error: 'Request body is required',
          message: 'Please provide a loan event in the request body'
        }
      };
    }

    let eventData: any;
    try {
      eventData = JSON.parse(body);
    } catch (parseError) {
      context.warn('Failed to parse request body as JSON', parseError);
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }
      };
    }

    // Handle Event Grid subscription validation
    if (Array.isArray(eventData) && eventData.length > 0 && eventData[0].eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
      context.log('Handling Event Grid subscription validation');
      const validationCode = eventData[0].data.validationCode;
      return {
        status: 200,
        jsonBody: {
          validationResponse: validationCode
        }
      };
    }

    // Handle Event Grid events
    if (Array.isArray(eventData)) {
      context.log(`Processing ${eventData.length} Event Grid event(s)`);
      
      for (const gridEvent of eventData) {
        // Extract loan event from Event Grid wrapper
        const event: LoanEvent = {
          type: mapEventGridEventType(gridEvent.eventType),
          data: gridEvent.data
        };

        // Validate and send notification
        if (!event.type || !event.data) {
          context.warn('Event missing type or data', event);
          continue;
        }

        const emailSender = getEmailSender();
        await sendNotification(event, { emailSender });
      }

      return {
        status: 200,
        jsonBody: {
          message: `Processed ${eventData.length} event(s) successfully`
        }
      };
    }

    // Handle direct loan events (non-Event Grid)
    const event: LoanEvent = eventData;
    
    // Validate event structure
    if (!event.type || !event.data) {
      context.warn('Event missing type or data', event);
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid event structure',
          message: 'Event must have "type" and "data" fields'
        }
      };
    }

    // Validate event type
    const validEventTypes = [
      'device.reserved', 
      'device.collected', 
      'device.returned',
      'device.reservation.cancelled',
      'loan.overdue'
    ];
    if (!validEventTypes.includes(event.type)) {
      context.warn(`Invalid event type: ${event.type}`);
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid event type',
          message: `Event type must be one of: ${validEventTypes.join(', ')}`,
          received: event.type
        }
      };
    }

    context.log(`Processing ${event.type} event for loan ${event.data.loanId}`);

    const startTime = Date.now();
    
    // Send the notification
    const emailSender = getEmailSender();
    const result = await sendNotification(event, { emailSender });

    const duration = Date.now() - startTime;

    if (!result.success) {
      // Track failed email
      trackEvent('EmailNotificationFailure', {
        eventType: event.type,
        loanId: event.data.loanId,
        error: result.error || 'Unknown error',
        duration: duration.toString()
      });
      
      trackMetric('EmailNotificationDuration', duration, { 
        eventType: event.type,
        status: 'failure'
      });

      context.error(`Failed to send notification: ${result.error}`);
      return {
        status: 400,
        jsonBody: {
          error: 'Notification failed',
          message: result.error
        }
      };
    }

    // Track successful email
    trackEvent('EmailNotificationSuccess', {
      eventType: event.type,
      loanId: event.data.loanId,
      emailSubject: result.emailSubject || 'Unknown',
      duration: duration.toString()
    });
    
    trackMetric('EmailNotificationDuration', duration, { 
      eventType: event.type,
      status: 'success'
    });

    context.log(`Email notification sent successfully: "${result.emailSubject}"`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        message: 'Email sent successfully',
        eventType: event.type,
        loanId: event.data.loanId,
        emailSubject: result.emailSubject
      }
    };

  } catch (error) {
    context.error('Unexpected error handling event', error);
    
    // Track unexpected error
    trackEvent('EmailNotificationError', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    };
  }
}

// Register the HTTP trigger function
app.http('handleEvent', {
  methods: ['POST'],
  authLevel: 'anonymous', // For local testing; change to 'function' for production
  route: 'handle-event',
  handler: handleEventHttp
});

/**
 * Maps Event Grid event types to internal loan event types
 */
function mapEventGridEventType(eventType: string): LoanEventType {
  const mapping: Record<string, LoanEventType> = {
    'Loan.Reserved': 'device.reserved',
    'Loan.Collected': 'device.collected',
    'Loan.Returned': 'device.returned'
  };
  return mapping[eventType] || 'device.reserved';
}
