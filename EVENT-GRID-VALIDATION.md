# Event Grid Subscription Validation Handshake

## Overview
When you create an Azure Event Grid subscription pointing to a webhook endpoint, Azure performs a **validation handshake** to ensure the endpoint is valid and you own it.

## How It Works

### 1. First Contact (Azure → Your Endpoint)
When creating the subscription, Azure Event Grid sends a special validation event:

```json
POST https://your-endpoint.com/api/handle-event
Content-Type: application/json

[
  {
    "id": "unique-event-id",
    "eventType": "Microsoft.EventGrid.SubscriptionValidationEvent",
    "subject": "",
    "eventTime": "2026-01-05T12:00:00.0000000Z",
    "data": {
      "validationCode": "abc123-xyz-789-unique-code",
      "validationUrl": "https://..."
    },
    "dataVersion": "1",
    "metadataVersion": "1"
  }
]
```

### 2. Detection (Your Code)
Your endpoint detects this is a validation request:

```typescript
// Check if this is a validation event
if (Array.isArray(eventData) && 
    eventData.length > 0 && 
    eventData[0].eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
  
  // This is the validation handshake
  context.log('Handling Event Grid subscription validation');
}
```

### 3. Response (Your Endpoint → Azure)
Your endpoint **must respond within 30 seconds** with the validation code:

```typescript
const validationCode = eventData[0].data.validationCode;

return {
  status: 200,
  jsonBody: {
    validationResponse: validationCode  // Echo the code back
  }
};
```

**Expected Response Format**:
```json
{
  "validationResponse": "abc123-xyz-789-unique-code"
}
```

### 4. Confirmation
- Azure receives the correct validation code
- Subscription status changes to **Active**
- Real events start flowing to your endpoint
- Validation never happens again for this subscription

## Implementation in Our Email Service

**File**: `email-notification-service/src/functions/handle-event-http.ts`

```typescript
// Handle Event Grid subscription validation
if (Array.isArray(eventData) && 
    eventData.length > 0 && 
    eventData[0].eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
  
  context.log('Handling Event Grid subscription validation');
  const validationCode = eventData[0].data.validationCode;
  
  return {
    status: 200,
    jsonBody: {
      validationResponse: validationCode
    }
  };
}
```

## Why This Exists

### Security Benefits
- **Ownership Proof**: Ensures you control the endpoint URL
- **Prevents Abuse**: Stops malicious actors from subscribing random URLs to your events
- **Authorization**: Confirms the endpoint is ready to receive events

### One-Time Process
- Happens **only once** during subscription creation
- Not sent with every event
- Must complete within 30 seconds or subscription fails

## Alternative: Validation URL Method

Azure also provides a `validationUrl` in the event data. You can:

**Option 1**: Respond with validation code (recommended - what we use)
```json
{ "validationResponse": "code" }
```

**Option 2**: Make GET request to `validationUrl` (manual alternative)
```bash
curl https://eventgrid.azure.com/validate?id=...
```

We use **Option 1** because it's automatic and works in code without external HTTP calls.

## Testing Locally

You can test the validation handler locally:

```bash
curl -X POST http://localhost:7073/api/handle-event \
  -H "Content-Type: application/json" \
  -d '[
    {
      "eventType": "Microsoft.EventGrid.SubscriptionValidationEvent",
      "data": {
        "validationCode": "test-123"
      }
    }
  ]'
```

**Expected Response**:
```json
{
  "validationResponse": "test-123"
}
```

## Event Flow After Validation

Once validated, subsequent POSTs will be real events:

```json
[
  {
    "id": "event-123",
    "eventType": "Loan.Reserved",
    "subject": "loans/loan-123",
    "eventTime": "2026-01-05T12:00:00Z",
    "data": {
      "loanId": "loan-123",
      "userId": "student@test.com",
      "deviceId": "device-456",
      "deviceModel": "iPad Pro"
    },
    "dataVersion": "1.0"
  }
]
```

Your endpoint processes these normally without validation checks.

## Current Status

✅ **Email Service**: Validation handler implemented and ready
✅ **Event Grid Topic**: `campus-device-loan-events` created
✅ **Subscription**: `email-notifications` created and **Active**
✅ **Endpoint**: `https://campus-email-notification.azurewebsites.net/api/handle-event`

The handshake was completed when the subscription was created in Azure. All future events bypass validation and go straight to email processing.
