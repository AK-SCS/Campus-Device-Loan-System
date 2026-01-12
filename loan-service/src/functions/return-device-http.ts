
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { returnDevice } from '../app/return-device';
import { getLoanRepo, getEventPublisher, getDeviceClient, getWaitlistRepo, getNotificationRepo } from '../config/appServices';
import { trackEvent, trackMetric } from '../infrastructure/telemetry.js';

export async function returnDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const startTime = Date.now();
  context.log('HTTP trigger function processing request for return device');

  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  try {

    const loanId = request.params.loanId;

    if (!loanId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'Loan ID is required'
        }
      };
    }

    await returnDevice(
      {
        loanRepo: getLoanRepo(),
        eventPublisher: getEventPublisher(),
        deviceClient: getDeviceClient(),
        waitlistRepo: getWaitlistRepo(),
        notificationRepo: getNotificationRepo()
      },
      { loanId }
    );

    const duration = Date.now() - startTime;

    trackEvent('DeviceReturnSuccess', {
      loanId,
      duration: duration.toString()
    });

    trackMetric('ReturnDuration', duration, { 
      operation: 'return',
      status: 'success'
    });

    context.log(`Successfully returned device for loan: ${loanId}`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: {
        message: 'Device returned successfully',
        loanId
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    trackEvent('DeviceReturnFailure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: duration.toString()
    });

    trackMetric('ReturnDuration', duration, { 
      operation: 'return',
      status: 'failure'
    });

    context.error('Error returning device:', error);

    if (error instanceof Error) {
      const errorMessage = error.message;

      if (
        errorMessage.includes('required') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('Only collected') ||
        errorMessage.includes('already been returned')
      ) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
          jsonBody: {
            error: errorMessage
          }
        };
      }
    }

    return {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('returnDevice', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'loans/{loanId}/return',
  handler: returnDeviceHttp
});

