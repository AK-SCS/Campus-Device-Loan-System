import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { EventGridPublisherClient, AzureKeyCredential } from "@azure/eventgrid";
import { getCorrelationId } from '../observability/correlation';
import { logInfo, logError } from '../observability/log';

/**
 * Event Grid Integration (Lab 4 - Optional/Stretch Goal)
 * 
 * This function demonstrates publishing events to Azure Event Grid
 * when a device loan/reservation is requested.
 * 
 * Real-world use case: When a device is loaned, publish an event that:
 * - Updates inventory
 * - Sends notifications
 * - Triggers other microservices
 */

export async function PublishDeviceEvent(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const correlationId = getCorrelationId(request);
    const startTime = Date.now();

    logInfo(context, "Event publication request started", {
        correlationId,
        method: request.method
    });

    try {
        // Parse request body
        const body = await request.json() as any;
        const deviceId = body.deviceId;
        const eventType = body.eventType || 'DeviceLoanRequested';
        const userId = body.userId || 'anonymous';

        if (!deviceId) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: "deviceId is required" })
            };
        }

        // Event Grid configuration (would come from environment variables in production)
        const endpoint = process.env.EVENT_GRID_ENDPOINT;
        const key = process.env.EVENT_GRID_KEY;

        // If Event Grid is not configured, just log and return success
        if (!endpoint || !key || endpoint === 'not-configured') {
            logInfo(context, "Event Grid not configured - simulating event publication", {
                correlationId,
                deviceId,
                eventType,
                userId
            });

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Event would be published (Event Grid not configured)",
                    event: {
                        eventType,
                        subject: `devices/${deviceId}`,
                        data: {
                            deviceId,
                            userId,
                            timestamp: new Date().toISOString(),
                            correlationId
                        }
                    }
                })
            };
        }

        // Publish event to Event Grid
        const client = new EventGridPublisherClient(
            endpoint,
            "EventGrid",
            new AzureKeyCredential(key)
        );

        const event = {
            id: correlationId,
            eventType: eventType,
            subject: `devices/${deviceId}`,
            dataVersion: "1.0",
            eventTime: new Date(),
            data: {
                deviceId: deviceId,
                userId: userId,
                timestamp: new Date().toISOString(),
                correlationId: correlationId
            }
        };

        await client.send([event]);

        const durationMs = Date.now() - startTime;

        logInfo(context, "Event published successfully", {
            correlationId,
            eventType,
            deviceId,
            durationMs
        });

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'x-correlation-id': correlationId
            },
            body: JSON.stringify({
                message: "Event published successfully",
                eventId: correlationId,
                eventType: eventType
            })
        };

    } catch (error) {
        const durationMs = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        logError(context, "Failed to publish event", {
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
                error: "Failed to publish event",
                correlationId
            })
        };
    }
}

app.http('PublishDeviceEvent', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: PublishDeviceEvent
});
