/**
 * Health Check HTTP Endpoint
 * Returns service health status and version information
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function healthCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Health check requested');

  const health = {
    service: 'Device Catalogue Service',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    usingCosmosDB: process.env.USE_AZURE === 'true' || process.env.NODE_ENV === 'production'
  };

  return {
    status: 200,
    jsonBody: health,
    headers: {
      'Content-Type': 'application/json'
    }
  };
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: healthCheck
});
