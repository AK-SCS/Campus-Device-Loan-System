import { PreInvocationContext, app } from '@azure/functions';
import { setupTelemetry } from './infrastructure/telemetry';

setupTelemetry();

app.hook.preInvocation(async (context: PreInvocationContext) => {
  context.invocationContext.log(`[PreInvocation] Function invoked`);
});
