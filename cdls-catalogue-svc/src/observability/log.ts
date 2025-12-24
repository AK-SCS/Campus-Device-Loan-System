import { InvocationContext } from "@azure/functions";

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  [key: string]: any;
}

export function log(
  context: InvocationContext,
  level: LogLevel,
  message: string,
  metadata: Record<string, any> = {}
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  };

  context.log(JSON.stringify(entry));
}

export function logInfo(
  context: InvocationContext,
  message: string,
  metadata: Record<string, any> = {}
): void {
  log(context, "info", message, metadata);
}

export function logWarn(
  context: InvocationContext,
  message: string,
  metadata: Record<string, any> = {}
): void {
  log(context, "warn", message, metadata);
}

export function logError(
  context: InvocationContext,
  message: string,
  metadata: Record<string, any> = {}
): void {
  log(context, "error", message, metadata);
}
