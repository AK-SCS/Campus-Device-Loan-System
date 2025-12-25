import { app, InvocationContext } from "@azure/functions";
import { logInfo } from '../observability/log';

/**
 * Event Grid Subscriber (Lab 4 - Optional/Stretch Goal)
 * 
 * This function receives events from Azure Event Grid.
 * It demonstrates event-driven architecture between microservices.
 * 
 * Real-world use case: When a device loan event is published:
 * - This handler could update a notification service
 * - Send emails to users
 * - Update dashboard statistics
 * - Trigger inventory management
 */

export async function HandleDeviceEvent(eventGridEvent: any, context: InvocationContext): Promise<void> {
    logInfo(context, "Event Grid event received", {
        eventType: eventGridEvent.eventType,
        subject: eventGridEvent.subject,
        id: eventGridEvent.id
    });

    // Extract event data
    const { deviceId, userId, timestamp } = eventGridEvent.data;

    // Process the event based on type
    switch (eventGridEvent.eventType) {
        case 'DeviceLoanRequested':
            logInfo(context, "Processing device loan request", {
                deviceId,
                userId,
                timestamp
            });
            // In a real application:
            // - Update device availability
            // - Send confirmation email
            // - Create loan record
            break;

        case 'DeviceReturned':
            logInfo(context, "Processing device return", {
                deviceId,
                userId,
                timestamp
            });
            // In a real application:
            // - Update device availability
            // - Send return confirmation
            // - Update loan record
            break;

        default:
            logInfo(context, "Unknown event type", {
                eventType: eventGridEvent.eventType
            });
    }
}

app.eventGrid('HandleDeviceEvent', {
    handler: HandleDeviceEvent
});
