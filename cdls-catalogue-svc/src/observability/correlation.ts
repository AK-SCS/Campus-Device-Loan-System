import { HttpRequest } from "@azure/functions";
import { randomUUID } from "crypto";

export function getCorrelationId(request: HttpRequest): string {
  const xCorrelationId = request.headers.get("x-correlation-id");
  if (xCorrelationId) {
    return xCorrelationId;
  }

  const xRequestId = request.headers.get("x-request-id");
  if (xRequestId) {
    return xRequestId;
  }

  const traceparent = request.headers.get("traceparent");
  if (traceparent) {
    const parts = traceparent.split("-");
    if (parts.length >= 2) {
      return parts[1];
    }
  }

  return randomUUID();
}
