import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listDevices } from '../application/listDevices';
import { deviceRepo } from '../appServices';

export async function GetDevices(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const devices = await listDevices(deviceRepo);

    return { 
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(devices)
    };
};

app.http('GetDevices', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: GetDevices
});
