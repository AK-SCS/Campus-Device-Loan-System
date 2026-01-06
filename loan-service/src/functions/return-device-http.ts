/**
 * Return Device HTTP Endpoint
 * 
 * POST /api/loans/{loanId}/return
 * Marks a collected loan as returned (staff only in production)
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { returnDevice } from '../app/return-device';
import { getLoanRepo, getEventPublisher, getDeviceClient, getWaitlistRepo, getNotificationRepo } from '../config/appServices';

export async function returnDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request for return device');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  try {
    // Get loan ID from route parameters
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

    // Call use case
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
    context.error('Error returning device:', error);

    // Handle specific business logic errors
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Client errors (400)
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

    // Server errors (500)
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



