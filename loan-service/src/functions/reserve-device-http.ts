/**
 * Reserve Device HTTP Endpoint
 * 
 * POST /api/loans/reserve
 * Request body: { userId: string, deviceId: string }
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { reserveDevice } from '../app/reserve-device';
import { getLoanRepo, getDeviceClient, getEventPublisher } from '../config/appServices';
import { validateToken, requireAuth } from '../auth/jwt-validator';
import { trackEvent, trackMetric } from '../infrastructure/telemetry.js';

export async function reserveDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const startTime = Date.now();
  context.log('HTTP trigger function processing request for reserve device');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: getCorsHeaders()
    };
  }

  // Check authentication
  const authError = requireAuth(request, context);
  if (authError) {
    return {
      status: authError.status,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: authError.jsonBody
    };
  }

  // Validate token
  let decodedToken;
  try {
    decodedToken = await validateToken(request, context);
    if (!decodedToken) {
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'Invalid or expired token'
        }
      };
    }
  } catch (error) {
    return {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: {
        error: 'Invalid authentication token'
      }
    };
  }

  try {
    // Parse request body
    const body = await request.json() as any;
    
    if (!body) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'Request body is required'
        }
      };
    }

    const { userId, deviceId } = body;

    // Validate required fields
    if (!userId || !deviceId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'userId and deviceId are required'
        }
      };
    }

    // Call use case
    const result = await reserveDevice(
      {
        loanRepo: getLoanRepo(),
        deviceClient: getDeviceClient(),
        eventPublisher: getEventPublisher()
      },
      { userId, deviceId }
    );

    const duration = Date.now() - startTime;
    
    // Track successful reservation
    trackEvent('DeviceReservationSuccess', {
      userId,
      deviceId,
      loanId: result.loanId,
      duration: duration.toString()
    });
    
    trackMetric('ReservationDuration', duration, { 
      operation: 'reserve',
      status: 'success'
    });

    context.log(`Successfully reserved device. Loan ID: ${result.loanId}`);

    return {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: result
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Track failed reservation
    trackEvent('DeviceReservationFailure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: duration.toString()
    });
    
    trackMetric('ReservationDuration', duration, { 
      operation: 'reserve',
      status: 'failure'
    });

    context.error('Error reserving device:', error);

    // Handle specific business logic errors
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Client errors (400)
      if (
        errorMessage.includes('required') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('not available') ||
        errorMessage.includes('already reserved')
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

app.http('reserveDevice', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'loans/reserve',
  handler: reserveDeviceHttp
});



