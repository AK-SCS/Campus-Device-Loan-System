
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDeviceRepo } from '../config/appServices.js';
import { getCorsHeaders } from '../utils/cors.js';
import { trackEvent, trackMetric } from '../infrastructure/telemetry.js';

export async function updateDeviceAvailability(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const startTime = Date.now();
  context.log('Updating device availability');

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

    const body = await request.json() as any;
    const decrementBy = body?.decrementBy || 1;

    const newAvailableCount = Math.max(0, device.availableCount - decrementBy);

    const updatedDevice = {
      ...device,
      availableCount: newAvailableCount
    };

    await repo.save(updatedDevice);

    const duration = Date.now() - startTime;

    trackEvent('DeviceAvailabilityUpdated', {
      deviceId,
      previousCount: device.availableCount.toString(),
      newCount: newAvailableCount.toString(),
      decrementBy: decrementBy.toString(),
      duration: duration.toString()
    });

    trackMetric('AvailabilityUpdateDuration', duration, { 
      operation: 'updateAvailability',
      status: 'success'
    });

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
    const duration = Date.now() - startTime;

    trackEvent('DeviceAvailabilityUpdateFailure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: duration.toString()
    });

    trackMetric('AvailabilityUpdateDuration', duration, { 
      operation: 'updateAvailability',
      status: 'failure'
    });

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
