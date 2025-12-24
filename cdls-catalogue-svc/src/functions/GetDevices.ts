import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listDevices } from '../application/listDevices';
import { getDeviceRepo } from '../appServices';
import { getCorrelationId } from '../observability/correlation';
import { logInfo, logError } from '../observability/log';

export async function GetDevices(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const correlationId = getCorrelationId(request);
    const startTime = Date.now();

    logInfo(context, "Request started", {
        correlationId,
        method: request.method,
        url: request.url
    });

    try {
        const devices = await listDevices(getDeviceRepo());

        const durationMs = Date.now() - startTime;
        const status = 200;

        logInfo(context, "Request completed", {
            correlationId,
            status,
            durationMs
        });

        return { 
            status,
            headers: {
                'Content-Type': 'application/json',
                'x-correlation-id': correlationId
            },
            body: JSON.stringify(devices)
        };
    } catch (error) {
        const durationMs = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        logError(context, "Request failed", {
            correlationId,
            durationMs,
            error: errorMessage
        });

        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'x-correlation-id': correlationId
            },
            body: JSON.stringify({
                error: "Internal Server Error",
                correlationId
            })
        };
    }
};

app.http('GetDevices', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: GetDevices
});
