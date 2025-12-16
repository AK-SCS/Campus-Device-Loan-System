import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function GetDevices(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const devices = [
        { id: "d1", brand: "Dell", model: "Latitude 5420", category: "Laptop", available: 5 },
        { id: "d2", brand: "Apple", model: "iPad Air", category: "Tablet", available: 2 },
        { id: "d3", brand: "Canon", model: "EOS 250D", category: "Camera", available: 1 }
    ];

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
