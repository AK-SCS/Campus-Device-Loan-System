import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { getCorrelationId } from '../observability/correlation';
import { logInfo, logError } from '../observability/log';

export async function Readiness(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const correlationId = getCorrelationId(request);
    const startTime = Date.now();

    logInfo(context, "Readiness check started", { correlationId });

    try {
        const endpoint = process.env.COSMOS_ENDPOINT!;
        const key = process.env.COSMOS_KEY!;
        const databaseId = process.env.COSMOS_DATABASE!;

        const client = new CosmosClient({ endpoint, key });
        const database = client.database(databaseId);
        await database.read();

        const durationMs = Date.now() - startTime;

        logInfo(context, "Readiness check passed", { correlationId, durationMs });

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'x-correlation-id': correlationId
            },
            body: JSON.stringify({ status: "ready", durationMs })
        };
    } catch (error) {
        const durationMs = Date.now() - startTime;

        logError(context, "Readiness check failed", {
            correlationId,
            durationMs,
            error: error instanceof Error ? error.message : String(error)
        });

        return {
            status: 503,
            headers: {
                'Content-Type': 'application/json',
                'x-correlation-id': correlationId
            },
            body: JSON.stringify({ status: "not-ready", correlationId })
        };
    }
}

app.http('Readiness', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: Readiness
});
