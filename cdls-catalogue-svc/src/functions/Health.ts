import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCorrelationId } from '../observability/correlation';
import { logInfo } from '../observability/log';

export async function Health(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const correlationId = getCorrelationId(request);

    logInfo(context, "Health check requested", { correlationId });

    return {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'x-correlation-id': correlationId
        },
        body: JSON.stringify({ status: "ok", service: "cdls-catalogue-svc" })
    };
}

app.http('Health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: Health
});
