
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { listDevices } from '../app/list-devices.js';
import { searchDevices } from '../app/search-devices.js';
import { getDeviceRepo } from '../config/appServices.js';
import { getCorsHeaders } from '../utils/cors.js';
import { trackEvent, trackMetric, trackException } from '../infrastructure/telemetry.js';

export async function listDevicesHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request for list/search devices');

  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: getCorsHeaders()
    };
  }

  try {
    const startTime = Date.now();
    const repo = getDeviceRepo();

    const category = request.query.get('category') as 'laptop' | 'tablet' | 'camera' | 'other' | null;
    const availableOnly = request.query.get('availableOnly') === 'true';
    const minAvailability = request.query.get('minAvailability') 
      ? parseInt(request.query.get('minAvailability')!, 10) 
      : undefined;

    if (category || availableOnly || minAvailability !== undefined) {

      if (category && !['laptop', 'tablet', 'camera', 'other'].includes(category)) {
        trackEvent('device-search-invalid-category', { category: category || '' });
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders()
          },
          jsonBody: {
            error: 'Invalid category. Must be: laptop, tablet, camera, or other'
          }
        };
      }

      const devices = await searchDevices(repo, {
        category,
        availableOnly,
        minAvailability
      });

      const duration = Date.now() - startTime;
      trackEvent('device-search-completed', { 
        category: category || 'all', 
        resultCount: devices.length.toString(),
        availableOnly: availableOnly.toString()
      });
      trackMetric('device-search-duration-ms', duration, { operation: 'search' });

      context.log(`Found ${devices.length} devices matching search criteria`);

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders()
        },
        jsonBody: devices
      };
    }

    const devices = await listDevices({
      deviceRepo: repo
    });

    const duration = Date.now() - startTime;
    trackEvent('device-list-completed', { resultCount: devices.length.toString() });
    trackMetric('device-list-duration-ms', duration, { operation: 'list' });

    context.log(`Successfully retrieved ${devices.length} devices`);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders()
      },
      jsonBody: devices
    };
  } catch (error) {
    trackException(error instanceof Error ? error : new Error(String(error)), { 
      function: 'listDevicesHttp' 
    });
    context.error('Error listing devices:', error);

    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders()
      },
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

app.http('listDevices', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'devices',
  handler: async (request, context) => {

    if (request.method === 'POST') {
      const { addDeviceHttp } = await import('./add-device-http.js');
      return addDeviceHttp(request, context);
    }

    return listDevicesHttp(request, context);
  }
});

