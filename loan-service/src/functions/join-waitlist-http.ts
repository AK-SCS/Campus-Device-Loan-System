/**
 * Azure Function: Join Waitlist (HTTP)
 * POST /api/waitlist
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { joinWaitlist } from '../app/join-waitlist.js';
import { getWaitlistRepo } from '../config/appServices.js';

export async function joinWaitlistHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger: Join waitlist');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  try {
    const body = await request.json() as any;

    if (!body.userId || !body.deviceId) {
      return {
        status: 400,
        headers: getCorsHeaders(),
        jsonBody: {
          error: 'userId and deviceId are required'
        }
      };
    }

    const repo = getWaitlistRepo();
    const waitlist = await joinWaitlist(repo, {
      userId: body.userId,
      userEmail: body.userEmail || '',
      userName: body.userName || '',
      deviceId: body.deviceId,
      deviceBrand: body.deviceBrand || '',
      deviceModel: body.deviceModel || ''
    });

    context.log(`User ${waitlist.userId} joined waitlist for device ${waitlist.deviceId}`);

    return {
      status: 201,
      headers: getCorsHeaders(),
      jsonBody: waitlist
    };

  } catch (error) {
    context.error('Error joining waitlist:', error);

    if (error instanceof Error && error.message.includes('already on the waitlist')) {
      return {
        status: 409,
        headers: getCorsHeaders(),
        jsonBody: {
          error: 'Already on waitlist',
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

app.http('joinWaitlist', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'waitlist',
  handler: joinWaitlistHttp
});
