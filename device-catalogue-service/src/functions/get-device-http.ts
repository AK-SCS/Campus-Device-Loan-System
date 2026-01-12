
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { getDevice } from '../app/get-device.js';
import { getDeviceRepo } from '../config/appServices.js';

export async function getDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request for get device');

  try {

    const deviceId = request.params.id;

    if (!deviceId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        jsonBody: {
          error: 'Bad Request',
          message: 'Device ID is required'
        }
      };
    }

    context.log(`Retrieving device with ID: ${deviceId}`);

    const device = await getDevice(
      {
        deviceRepo: getDeviceRepo()
      },
      {
        deviceId
      }
    );

    if (!device) {
      context.log(`Device not found: ${deviceId}`);
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        jsonBody: {
          error: 'Not Found',
          message: `Device with ID '${deviceId}' not found`
        }
      };
    }

    context.log(`Successfully retrieved device: ${deviceId}`);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      jsonBody: device
    };
  } catch (error) {
    context.error('Error getting device:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        jsonBody: {
          error: 'Bad Request',
          message: error.message
        }
      };
    }

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

app.http('getDevice', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'devices/{id}',
  handler: getDeviceHttp
});

