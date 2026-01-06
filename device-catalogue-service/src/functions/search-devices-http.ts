/**
 * Azure Function: Search Devices (HTTP)
 * GET /api/devices/search?category=laptop&availableOnly=true
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { searchDevices } from '../app/search-devices.js';
import { getDeviceRepo } from '../config/appServices.js';

export async function searchDevicesHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger: Search devices');

  try {
    // Get query parameters
    const category = request.query.get('category') as 'laptop' | 'tablet' | 'camera' | 'other' | null;
    const availableOnly = request.query.get('availableOnly') === 'true';
    const minAvailability = request.query.get('minAvailability') 
      ? parseInt(request.query.get('minAvailability')!, 10) 
      : undefined;

    // Validate category if provided
    if (category && !['laptop', 'tablet', 'camera', 'other'].includes(category)) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid category. Must be: laptop, tablet, camera, or other'
        }
      };
    }

    // Get repository
    const repo = getDeviceRepo();

    // Search devices
    const devices = await searchDevices(repo, {
      category,
      availableOnly,
      minAvailability
    });

    context.log(`Found ${devices.length} devices matching criteria`);

    return {
      status: 200,
      jsonBody: devices
    };

  } catch (error) {
    context.error('Error searching devices:', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('searchDevices', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'devices/search',
  handler: searchDevicesHttp
});



