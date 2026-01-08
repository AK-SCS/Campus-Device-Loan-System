/**
 * Readiness Check HTTP Endpoint
 * Returns whether the service and its dependencies are ready to handle requests
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getLoanRepo } from '../config/appServices';

export async function readinessCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Readiness check requested');

  const checks: { [key: string]: boolean } = {
    service: true,
    database: false,
    eventGrid: true // Event Grid is passive, assume ready
  };

  try {
    // Check if we can connect to Cosmos DB
    const repo = getLoanRepo();
    await repo.list(); // Try to query the database
    checks.database = true;
  } catch (error) {
    context.error('Database connection failed:', error);
    checks.database = false;
  }

  const allReady = Object.values(checks).every(status => status === true);

  const readiness = {
    ready: allReady,
    checks,
    timestamp: new Date().toISOString()
  };

  return {
    status: allReady ? 200 : 503,
    jsonBody: readiness,
    headers: {
      'Content-Type': 'application/json'
    }
  };
}

app.http('ready', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'ready',
  handler: readinessCheck
});
