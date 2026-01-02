import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDeviceRepo } from '../config/appServices.js';
import { listDevices } from '../app/list-devices.js';

export async function listDevicesHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing request for ${request.url}`);

  try {
    const devices = await listDevices({
      deviceRepo: getDeviceRepo(),
    });

    return {
      status: 200,
      jsonBody: {
        devices,
        count: devices.length,
      },
    };
  } catch (error: any) {
    context.error('Error listing devices:', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

app.http('listDevices', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'devices',
  handler: listDevicesHttp,
});
