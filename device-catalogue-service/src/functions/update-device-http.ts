
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { updateDevice } from '../app/update-device.js';
import { CreateDeviceInput } from '../domain/device.js';
import { getDeviceRepo } from '../config/appServices.js';

export async function updateDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger: Update device');

  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

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

    const body = await request.json() as Partial<CreateDeviceInput>;

    if (!body) {
      return {
        status: 400,
        jsonBody: {
          error: 'Request body is required'
        }
      };
    }

    const repo = getDeviceRepo();

    const device = await updateDevice(repo, deviceId, body);

    context.log(`Device updated: ${device.id} - ${device.brand} ${device.model}`);

    return {
      status: 200,
      headers: getCorsHeaders(),
      jsonBody: device
    };

  } catch (error) {
    context.error('Error updating device:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return {
        status: 404,
        headers: getCorsHeaders(),
        jsonBody: {
          error: 'Device not found',
          message: error.message
        }
      };
    }

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

