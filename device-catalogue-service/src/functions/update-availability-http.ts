
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { updateDeviceAvailability } from '../app/update-device-availability.js';
import { getDeviceRepo } from '../config/appServices.js';

interface UpdateAvailabilityRequest {
  change: number;
}

export async function updateAvailabilityHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger: Update device availability');

  try {

    const deviceId = request.params.id;

    if (!deviceId) {
      return {
        status: 400,
        jsonBody: {
          error: 'Device ID is required'
        }
      };
    }

    const body = await request.json() as UpdateAvailabilityRequest;

    if (!body || body.change === undefined) {
      return {
        status: 400,
        jsonBody: {
          error: 'Request body with "change" property is required'
        }
      };
    }

    if (typeof body.change !== 'number') {
      return {
        status: 400,
        jsonBody: {
          error: 'Change must be a number'
        }
      };
    }

    const repo = getDeviceRepo();

    const device = await updateDeviceAvailability(repo, deviceId, body.change);

    context.log(`Device availability updated: ${device.id} - ${device.availableCount} available`);

    return {
      status: 200,
      jsonBody: device
    };

  } catch (error) {
    context.error('Error updating availability:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return {
        status: 404,
        jsonBody: {
          error: 'Device not found',
          message: error.message
        }
      };
    }

    if (error instanceof Error && error.message.includes('availability')) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid availability change',
          message: error.message
        }
      };
    }

    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('updateAvailability', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'devices/{id}/availability',
  handler: updateAvailabilityHttp
});

