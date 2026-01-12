import * as appInsights from 'applicationinsights';
import { context, trace } from '@opentelemetry/api';

type SeverityLevel = 0 | 1 | 2 | 3 | 4;

let telemetryClient: appInsights.TelemetryClient | null = null;

export function setupTelemetry(): void {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.log('⚠️  Application Insights not configured - telemetry disabled');
    return;
  }

  try {
    appInsights.setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    telemetryClient = appInsights.defaultClient;
    telemetryClient.context.tags[telemetryClient.context.keys.cloudRole] = 'device-catalogue-service';
    telemetryClient.context.tags[telemetryClient.context.keys.cloudRoleInstance] = process.env.WEBSITE_INSTANCE_ID || 'local';

    console.log('✅ Application Insights telemetry initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Application Insights:', error);
  }
}

export function trackEvent(name: string, properties?: { [key: string]: string }): void {
  if (telemetryClient) {
    telemetryClient.trackEvent({ name, properties });
  }
}

export function trackMetric(name: string, value: number, properties?: { [key: string]: string }): void {
  if (telemetryClient) {
    telemetryClient.trackMetric({ name, value, properties });
  }
}

export function trackTrace(message: string, severity?: string, properties?: { [key: string]: string }): void {
  if (telemetryClient) {
    telemetryClient.trackTrace({ message, severity: severity as any, properties });
  }
}

export function trackException(exception: Error, properties?: { [key: string]: string }): void {
  if (telemetryClient) {
    telemetryClient.trackException({ exception, properties });
  }
}

export function trackDependency(name: string, data: string, duration: number, success: boolean, dependencyType: string = 'HTTP', properties?: { [key: string]: string }): void {
  if (telemetryClient) {
    telemetryClient.trackDependency({
      name,
      data,
      duration,
      success,
      dependencyTypeName: dependencyType,
      properties
    });
  }
}

export function getCurrentOperationId(): string | undefined {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    return spanContext.traceId;
  }
  return undefined;
}

export function flushTelemetry(): Promise<void> {
  if (telemetryClient) {
    return new Promise((resolve) => {
      telemetryClient!.flush();
      resolve();
    });
  }
  return Promise.resolve();
}
