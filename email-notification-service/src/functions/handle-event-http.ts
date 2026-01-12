
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { sendNotification, type LoanEvent, type LoanEventType } from '../app/send-notification';
import { getEmailSender } from '../config/appServices';
import { trackEvent, trackMetric } from '../infrastructure/telemetry.js';

export async function handleEventHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing event request');

  try {

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

    if (Array.isArray(eventData)) {
      context.log(`Processing ${eventData.length} Event Grid event(s)`);

      for (const gridEvent of eventData) {

        const event: LoanEvent = {
          type: mapEventGridEventType(gridEvent.eventType),
          data: gridEvent.data
        };

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

    const event: LoanEvent = eventData;

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

    const emailSender = getEmailSender();
    const result = await sendNotification(event, { emailSender });

    const duration = Date.now() - startTime;

    if (!result.success) {

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

app.http('handleEvent', {
  methods: ['POST'],
  authLevel: 'anonymous', 
  route: 'handle-event',
  handler: handleEventHttp
});

function mapEventGridEventType(eventType: string): LoanEventType {
  const mapping: Record<string, LoanEventType> = {
    'Loan.Reserved': 'device.reserved',
    'Loan.Collected': 'device.collected',
    'Loan.Returned': 'device.returned'
  };
  return mapping[eventType] || 'device.reserved';
}
