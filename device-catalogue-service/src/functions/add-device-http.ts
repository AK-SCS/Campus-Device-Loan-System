/**
 * Azure Function: Add Device (HTTP)
 * POST /api/devices
 */

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
  
  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  context.log('HTTP trigger: Add device');

  try {
    // Parse request body
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

    // Get repository
    const repo = getDeviceRepo();

    // Add device
    const device = await addDevice(repo, body);

    const duration = Date.now() - startTime;
    
    // Track successful device creation
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
    
    // Track failed device creation
    trackEvent('DeviceCreationFailure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: duration.toString()
    });
    
    trackMetric('DeviceOperationDuration', duration, { 
      operation: 'create',
      status: 'failure'
    });

    context.error('Error adding device:', error);
    
    // Return 400 for validation errors
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

// Route registration disabled - merged with list-devices-http.ts to avoid route conflict
// app.http('addDevice', {
//   methods: ['POST', 'OPTIONS'],
//   authLevel: 'anonymous',
//   route: 'devices',
//   handler: addDeviceHttp
// });



