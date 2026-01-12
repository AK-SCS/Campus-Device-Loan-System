
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getLoanRepo } from '../config/appServices';

export async function readinessCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Readiness check requested');

  const checks: { [key: string]: boolean } = {
    service: true,
    database: false,
    eventGrid: true 
  };

  try {

    const repo = getLoanRepo();
    await repo.list(); 
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
