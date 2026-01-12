
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getNotificationRepo } from '../config/appServices.js';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

export async function getNotificationsHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  context.log('HTTP trigger: Get user notifications');

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

    const repo = getNotificationRepo();
    const notifications = await repo.getByUserId(userId);

    context.log(`Retrieved ${notifications.length} notifications for user ${userId}`);

    return {
      status: 200,
      headers: getCorsHeaders(),
      jsonBody: notifications
    };

  } catch (error) {
    context.error('Error getting notifications:', error);

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

app.http('getNotifications', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'notifications',
  handler: getNotificationsHttp
});
