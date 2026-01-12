
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { collectDevice } from '../app/collect-device';
import { getLoanRepo, getEventPublisher, getNotificationRepo } from '../config/appServices';

export async function collectDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request for collect device');

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

    await collectDevice(
      {
        loanRepo: getLoanRepo(),
        eventPublisher: getEventPublisher(),
        notificationRepo: getNotificationRepo()
      },
      { loanId }
    );

    context.log(`Successfully collected device for loan: ${loanId}`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: {
        message: 'Device collected successfully',
        loanId
      }
    };

  } catch (error) {
    context.error('Error collecting device:', error);

    if (error instanceof Error) {
      const errorMessage = error.message;

      if (
        errorMessage.includes('required') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('Only reserved') ||
        errorMessage.includes('already been collected')
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

app.http('collectDevice', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'loans/{loanId}/collect',
  handler: collectDeviceHttp
});

