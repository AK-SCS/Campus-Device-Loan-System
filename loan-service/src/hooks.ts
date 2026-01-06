import { PreInvocationContext, app } from '@azure/functions';
import { setupTelemetry } from './infrastructure/telemetry';

// Initialize telemetry once when the app starts
setupTelemetry();

// Pre-invocation hook to set up context for each function call
app.hook.preInvocation(async (context: PreInvocationContext) => {
  context.invocationContext.log(`[PreInvocation] Function invoked`);
});
