/**
 * Azure Function: Delete Device (HTTP)
 * DELETE /api/devices/{id}
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { deleteDevice } from '../app/delete-device.js';
import { getDeviceRepo } from '../config/appServices.js';

export async function deleteDeviceHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger: Delete device');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  try {
    // Get device ID from route
    const deviceId = request.params.id;

    if (!deviceId) {
      return {
        status: 400,
        jsonBody: {
          error: 'Device ID is required'
        }
      };
    }

    // Get repository
    const repo = getDeviceRepo();

    // Delete device
    await deleteDevice(repo, deviceId);

    context.log(`Device deleted: ${deviceId}`);

    return {
      status: 204, // No content
      headers: getCorsHeaders()
    };

  } catch (error) {
    context.error('Error deleting device:', error);
    
    // Return 404 if device not found
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

app.http('deleteDevice', {
  methods: ['DELETE', 'PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'devices/{id}',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: getCorsHeaders()
      };
    }

    // Handle PUT (update)
    if (request.method === 'PUT') {
      context.log('HTTP trigger: Update device');
      
      try {
        const deviceId = request.params.id;
        if (!deviceId) {
          return {
            status: 400,
            headers: getCorsHeaders(),
            jsonBody: { error: 'Device ID is required' }
          };
        }

        const body = await request.json() as any;
        if (!body) {
          return {
            status: 400,
            headers: getCorsHeaders(),
            jsonBody: { error: 'Request body is required' }
          };
        }

        const repo = getDeviceRepo();
        const { updateDevice } = await import('../app/update-device.js');
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
            jsonBody: { error: 'Device not found', message: error.message }
          };
        }

        if (error instanceof Error && error.message.includes('required')) {
          return {
            status: 400,
            headers: getCorsHeaders(),
            jsonBody: { error: 'Validation failed', message: error.message }
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

    // Handle DELETE (original delete logic)
    return deleteDeviceHttp(request, context);
  }
});



