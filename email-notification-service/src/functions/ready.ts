
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function readinessCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Readiness check requested');

  const checks: { [key: string]: boolean } = {
    service: true,
    sendGrid: true 
  };

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
