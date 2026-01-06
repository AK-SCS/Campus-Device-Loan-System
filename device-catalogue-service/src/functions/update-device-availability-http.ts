/**
 * Update Device Availability HTTP Function
 * POST /api/devices/{id}/update-availability
 * Updates the available count for a device by querying active loans
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDeviceRepo } from '../config/appServices.js';
import { getCorsHeaders } from '../utils/cors.js';

export async function updateDeviceAvailability(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Updating device availability');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: getCorsHeaders()
    };
  }

  try {
    const deviceId = request.params.id;

    if (!deviceId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders()
        },
        jsonBody: {
          error: 'Device ID is required'
        }
      };
    }

    const repo = getDeviceRepo();
    const device = await repo.getById(deviceId);

    if (!device) {
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders()
        },
        jsonBody: {
          error: 'Device not found'
        }
      };
    }

    // Get the count to decrement from request body
    const body = await request.json() as any;
    const decrementBy = body?.decrementBy || 1;

    // Update available count
    const newAvailableCount = Math.max(0, device.availableCount - decrementBy);
    
    const updatedDevice = {
      ...device,
      availableCount: newAvailableCount
    };

    await repo.save(updatedDevice);

    context.log(`Updated device ${deviceId}: available count ${device.availableCount} -> ${newAvailableCount}`);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders()
      },
      jsonBody: updatedDevice
    };

  } catch (error: any) {
    context.error('Error updating device availability:', error);

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders()
      },
      jsonBody: {
        error: 'Internal server error',
        message: error.message
      }
    };
  }
}

app.http('updateDeviceAvailability', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'devices/{id}/update-availability',
  handler: updateDeviceAvailability
});
