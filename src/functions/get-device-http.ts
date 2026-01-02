import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDeviceRepo } from '../config/appServices.js';
import { getDevice } from '../app/get-device.js';

export async function getDeviceHttp(
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

    const device = await getDevice(id, {
      deviceRepo: getDeviceRepo(),
    });

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
    context.error('Error getting device:', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

app.http('getDevice', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'devices/{id}',
  handler: getDeviceHttp,
});
