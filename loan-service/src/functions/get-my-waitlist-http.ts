
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { getWaitlistRepo } from '../config/appServices.js';

export async function getMyWaitlistHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger: Get my waitlist entries');

  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  try {
    const userId = request.query.get('userId');

    if (!userId) {
      return {
        status: 400,
        headers: getCorsHeaders(),
        jsonBody: {
          error: 'userId query parameter is required'
        }
      };
    }

    const repo = getWaitlistRepo();
    const waitlists = await repo.getByUserId(userId);

    context.log(`Retrieved ${waitlists.length} waitlist entries for user ${userId}`);

    return {
      status: 200,
      headers: getCorsHeaders(),
      jsonBody: waitlists
    };

  } catch (error) {
    context.error('Error getting waitlist entries:', error);

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

app.http('getMyWaitlist', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'waitlist/my',
  handler: getMyWaitlistHttp
});
