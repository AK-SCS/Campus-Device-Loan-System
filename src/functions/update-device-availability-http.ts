import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDeviceRepo } from '../config/appServices.js';
import { updateDeviceAvailability } from '../app/update-device-availability.js';

export async function updateDeviceAvailabilityHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing request for ${request.url}`);

  try {
    const id = request.params.id;
    
    if (!id) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Device ID is required',
        },
      };
    }

    const body = await request.json() as any;
    
    if (typeof body?.availableCount !== 'number') {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'availableCount is required and must be a number',
        },
      };
    }

    const device = await updateDeviceAvailability(
      {
        deviceId: id,
        availableCount: body.availableCount,
      },
      {
        deviceRepo: getDeviceRepo(),
      }
    );

    if (!device) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not Found',
          message: `Device with ID '${id}' not found`,
        },
      };
    }

    return {
      status: 200,
      jsonBody: device,
    };
  } catch (error: any) {
    context.error('Error updating device availability:', error);
    
    if (error.message?.includes('between 0 and total count')) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: error.message,
        },
      };
    }
    
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

app.http('updateDeviceAvailability', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'devices/{id}/availability',
  handler: updateDeviceAvailabilityHttp,
});
