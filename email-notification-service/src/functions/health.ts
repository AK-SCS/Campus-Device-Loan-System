
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function healthCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Health check requested');

  const health = {
    service: 'Email Notification Service',
    status: 'healthy',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    usingSendGrid: process.env.USE_SENDGRID === 'true',
    deployment: 'CI/CD automated'
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
