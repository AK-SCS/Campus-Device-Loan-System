
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getNotificationRepo } from '../config/appServices.js';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

export async function markNotificationReadHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: getCorsHeaders()
    };
  }

  context.log('HTTP trigger: Mark notification as read');

  try {
    const notificationId = request.params.id;

    if (!notificationId) {
      return {
        status: 400,
        headers: getCorsHeaders(),
        jsonBody: {
          error: 'Notification ID is required'
        }
      };
    }

    const repo = getNotificationRepo();
    await repo.markAsRead(notificationId);

    context.log(`Marked notification ${notificationId} as read`);

    return {
      status: 200,
      headers: getCorsHeaders(),
      jsonBody: {
        message: 'Notification marked as read'
      }
    };

  } catch (error) {
    context.error('Error marking notification as read:', error);

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

app.http('markNotificationRead', {
  methods: ['PATCH', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'notifications/{id}/read',
  handler: markNotificationReadHttp
});
