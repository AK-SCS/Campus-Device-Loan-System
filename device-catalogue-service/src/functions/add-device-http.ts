
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { addDevice } from '../app/add-device.js';
import { CreateDeviceInput } from '../domain/device.js';
import { getDeviceRepo } from '../config/appServices.js';
import { trackEvent, trackMetric } from '../infrastructure/telemetry.js';

export async function addDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const startTime = Date.now();

  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  context.log('HTTP trigger: Add device');

  try {

    const body = await request.json() as CreateDeviceInput;

    if (!body) {
      return {
        status: 400,
        headers: getCorsHeaders(),
        jsonBody: {
          error: 'Request body is required'
        }
      };
    }

    const repo = getDeviceRepo();

    const device = await addDevice(repo, body);

    const duration = Date.now() - startTime;

    trackEvent('DeviceCreated', {
      deviceId: device.id,
      brand: device.brand,
      model: device.model,
      category: device.category,
      duration: duration.toString()
    });

    trackMetric('DeviceOperationDuration', duration, { 
      operation: 'create',
      status: 'success'
    });

    context.log(`Device added: ${device.id} - ${device.brand} ${device.model}`);

    return {
      status: 201,
      headers: getCorsHeaders(),
      jsonBody: device
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    trackEvent('DeviceCreationFailure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: duration.toString()
    });

    trackMetric('DeviceOperationDuration', duration, { 
      operation: 'create',
      status: 'failure'
    });

    context.error('Error adding device:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return {
        status: 400,
        headers: getCorsHeaders(),
        jsonBody: {
          error: 'Validation failed',
          message: error.message
        }
      };
    }

    return {
      status: 500,
      headers: getCorsHeaders(),
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

