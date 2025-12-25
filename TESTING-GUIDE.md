# Testing Instructions for Catalogue Service

## Local Testing

### Start the Service

```bash
cd /workspaces/Campus-Device-Loan-System/cdls-catalogue-svc
npm install
npm run build
npm start
```

### Test Endpoints

**Browser Testing:**
- http://localhost:7071/api/Health
- http://localhost:7071/api/Readiness  
- http://localhost:7071/api/GetDevices

**Postman Testing:**

1. **Health Check (GET)**
   - URL: `http://localhost:7071/api/Health`
   - Method: GET
   - Expected: `{"status":"ok","service":"cdls-catalogue-svc"}`

2. **Readiness Check (GET)**
   - URL: `http://localhost:7071/api/Readiness`
   - Method: GET
   - Expected: `{"status":"ready","durationMs":...}` (when using fake repository)

3. **Get Devices (GET)**
   - URL: `http://localhost:7071/api/GetDevices`
   - Method: GET
   - Expected: Array of 3 devices with Dell laptop, iPad Air, Canon camera

4. **Get Devices (POST)**
   - URL: `http://localhost:7071/api/GetDevices`
   - Method: POST
   - Expected: Same array of devices

### Using curl (Alternative to Postman)

```bash
# Health check
curl http://localhost:7071/api/Health

# Get devices
curl http://localhost:7071/api/GetDevices

# Get devices with correlation ID
curl -H "x-correlation-id: test-123" http://localhost:7071/api/GetDevices
```

---

## Azure Testing

After deploying with `./deploy-to-azure.sh`, test these URLs (replace `[YOUR-ID]` with your unique ID):

```bash
# Health check
curl https://cdls-catalogue-test-[YOUR-ID]-func.azurewebsites.net/api/Health

# Get devices
curl https://cdls-catalogue-test-[YOUR-ID]-func.azurewebsites.net/api/GetDevices
```

---

## Expected Responses

### Health Endpoint
```json
{
  "status": "ok",
  "service": "cdls-catalogue-svc"
}
```

### Get Devices Endpoint
```json
[
  {
    "id": "d1",
    "brand": "Dell",
    "model": "Latitude 5420",
    "category": "Laptop",
    "available": 5
  },
  {
    "id": "d2",
    "brand": "Apple",
    "model": "iPad Air",
    "category": "Tablet",
    "available": 2
  },
  {
    "id": "d3",
    "brand": "Canon",
    "model": "EOS 250D",
    "category": "Camera",
    "available": 1
  }
]
```

### Readiness Endpoint (when using FakeDeviceRepository)
```json
{
  "status": "ready",
  "durationMs": 5
}
```

---

## Observability Features to Notice

All responses include:
- `x-correlation-id` header - for request tracing
- Structured JSON logs in the terminal (with correlationId, timestamp, level, message)
- Duration metrics (durationMs) logged for each request

Check the terminal output while testing to see structured logging in action!
