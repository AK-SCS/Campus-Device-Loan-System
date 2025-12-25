# Lab 3 & 4 Completion Guide

## Overview
This guide covers completing **Lab 3 (Week 5)** and **Lab 4 (Week 6)** for the Campus Device Loan System ICA.

## ✅ What's Already Implemented

### Lab 3 Components:
- ✅ Separate development environment scripts
- ✅ Frontend SPA (Single Page Application)
- ✅ CORS configuration for Function App
- ✅ Frontend deployment to Azure Storage
- ✅ Automated deployment scripts

### Lab 4 Components:
- ✅ Event Grid publisher function
- ✅ Event Grid subscriber function
- ✅ Event-driven architecture example

---

## 🎯 Lab 3 Tasks

### Task 1: Set Up Development Environment (15 minutes)

**Purpose**: Create a separate Cosmos DB instance for development (separate from test/production)

**Steps:**

```bash
cd /workspaces/Campus-Device-Loan-System
./setup-dev-environment.sh
```

This script will:
1. Create a new resource group for development
2. Provision a Cosmos DB account for dev environment
3. Create database and container
4. Update `local.settings.json` with dev credentials

**After setup:**

```bash
# Seed the development database
cd cdls-catalogue-svc
npm run seed

# Test locally with dev Cosmos DB
npm start
```

**Verify:**
- Open http://localhost:7071/api/GetDevices
- Should see 14 devices from your dev Cosmos DB

---

### Task 2: Configure CORS on Function App (5 minutes)

**Purpose**: Allow frontend to call backend API from different domain

**Steps:**

```bash
cd /workspaces/Campus-Device-Loan-System
./configure-cors.sh
```

This configures your Function App to accept requests from:
- http://localhost:5500 (Live Server)
- http://localhost:8080
- Your Azure Storage static website

**Verify:**
```bash
# Test CORS is working
curl -H "Origin: http://localhost:5500" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://cdls-catalogue-test-cat2025-func.azurewebsites.net/api/GetDevices
```

---

### Task 3: Deploy Frontend to Azure Storage (10 minutes)

**Purpose**: Host the SPA as a static website in Azure Storage

**Steps:**

```bash
cd /workspaces/Campus-Device-Loan-System
./deploy-frontend.sh
```

This script will:
1. Create a storage account
2. Enable static website hosting
3. Upload the frontend files
4. Provide the public URL

**After deployment**, you'll get a URL like:
```
https://cdlsfecat2025.z6.web.core.windows.net/
```

**Verify:**
1. Open the URL in your browser
2. Enter your Function App URL in the input field:
   ```
   https://cdls-catalogue-test-cat2025-func.azurewebsites.net/api/GetDevices
   ```
3. Click "Load Devices"
4. Should see all devices displayed

---

### Task 4: Test End-to-End (10 minutes)

**Test the complete flow:**

1. **Local Testing with Frontend**:
   ```bash
   # In VS Code, right-click frontend/index.html
   # Select "Open with Live Server"
   # Or just open frontend/index.html in browser
   ```

2. **Enter API URL**:
   - Local: `http://localhost:7071/api/GetDevices`
   - Azure: `https://cdls-catalogue-test-cat2025-func.azurewebsites.net/api/GetDevices`

3. **Click "Load Devices"**

4. **Test Filtering**:
   - Use category dropdown to filter by Laptop, Tablet, Camera, etc.

5. **Take Screenshots**:
   - Frontend showing all devices
   - Frontend with filtered view
   - Browser developer tools showing successful API call
   - Network tab showing CORS headers

---

## 🎯 Lab 4 Tasks (Optional/Stretch)

### Understanding Event Grid

Event Grid enables event-driven architecture between microservices. When something happens (e.g., a device is loaned), an event is published, and other services can react to it.

### Task 1: Review Event Grid Implementation

**Files created:**
- `cdls-catalogue-svc/src/functions/PublishDeviceEvent.ts` - Publishes events
- `cdls-catalogue-svc/src/functions/HandleDeviceEvent.ts` - Receives events

**How it works:**
1. When a device is loaned, call the `PublishDeviceEvent` endpoint
2. Event is published to Event Grid
3. `HandleDeviceEvent` receives the event
4. Can trigger actions like sending emails, updating inventory, etc.

### Task 2: Test Event Publishing (Local)

```bash
# Build the new functions
cd cdls-catalogue-svc
npm run build
npm start
```

```bash
# Test event publishing (in another terminal)
curl -X POST http://localhost:7071/api/PublishDeviceEvent \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "d1",
    "eventType": "DeviceLoanRequested",
    "userId": "user123"
  }'
```

**Expected response:**
```json
{
  "message": "Event would be published (Event Grid not configured)",
  "event": {
    "eventType": "DeviceLoanRequested",
    "subject": "devices/d1",
    "data": { ... }
  }
}
```

### Task 3: Deploy Event Grid (Optional - if time permits)

To fully implement Event Grid, you would:

1. **Create Event Grid Topic**:
   ```bash
   az eventgrid topic create \
     --name cdls-events \
     --resource-group cdls-catalogue-test-cat2025-rg \
     --location swedencentral
   ```

2. **Get endpoint and key**:
   ```bash
   az eventgrid topic show \
     --name cdls-events \
     --resource-group cdls-catalogue-test-cat2025-rg \
     --query "endpoint" -o tsv
   
   az eventgrid topic key list \
     --name cdls-events \
     --resource-group cdls-catalogue-test-cat2025-rg \
     --query "key1" -o tsv
   ```

3. **Update Function App settings**:
   ```bash
   az functionapp config appsettings set \
     --name cdls-catalogue-test-cat2025-func \
     --resource-group cdls-catalogue-test-cat2025-rg \
     --settings \
       EVENT_GRID_ENDPOINT="<endpoint>" \
       EVENT_GRID_KEY="<key>"
   ```

4. **Redeploy Function App**:
   ```bash
   cd cdls-catalogue-svc
   func azure functionapp publish cdls-catalogue-test-cat2025-func
   ```

**Note**: Event Grid is an **optional/stretch goal** for Lab 4. Focus on Lab 3 first!

---

## 📋 Lab 3 Completion Checklist

- [ ] Created development Cosmos DB environment
- [ ] Seeded development database with devices
- [ ] Configured CORS on Function App
- [ ] Deployed frontend to Azure Storage
- [ ] Tested frontend locally with API
- [ ] Tested deployed frontend with deployed API
- [ ] **Screenshot**: Frontend showing all devices
- [ ] **Screenshot**: Frontend with category filter
- [ ] **Screenshot**: Browser dev tools showing CORS headers
- [ ] **Screenshot**: Network tab showing successful API call

---

## 📋 Lab 4 Completion Checklist (Optional)

- [ ] Reviewed Event Grid publisher code
- [ ] Reviewed Event Grid subscriber code
- [ ] Tested event publishing locally
- [ ] (Optional) Created Event Grid topic in Azure
- [ ] (Optional) Configured Function App with Event Grid credentials
- [ ] (Optional) Tested event publishing on Azure
- [ ] **Screenshot**: Event publishing response

---

## 🎓 Architecture Achieved

### Frontend (SPA):
- **Technology**: HTML, CSS, JavaScript
- **Hosting**: Azure Storage Static Website
- **Features**: Device catalogue, filtering, responsive design

### Backend (Microservice):
- **Technology**: Azure Functions, TypeScript, Node.js
- **Database**: Cosmos DB (separate dev/test instances)
- **Features**: RESTful API, CORS enabled, structured logging

### Event-Driven (Lab 4):
- **Technology**: Azure Event Grid
- **Pattern**: Publisher/Subscriber
- **Use Case**: Inter-service communication

---

## 🆘 Troubleshooting

### Frontend can't connect to API:
**Error**: "CORS error" or "Access denied"
**Solution**:
```bash
./configure-cors.sh
```

### Frontend shows "No devices found":
**Solution**:
1. Check API URL is correct
2. Test API directly: `curl <your-api-url>`
3. Check browser console for errors

### Storage account name already taken:
**Solution**: Edit scripts and change `UNIQUE_ID` to something else

### Event Grid not working:
**Solution**: Make sure you've:
1. Created Event Grid topic
2. Updated Function App settings
3. Redeployed the Function App

---

## 📊 What You've Learned

| Lab 3 Concept | Implementation | ICA Alignment |
|---------------|----------------|---------------|
| Multiple Environments | Separate dev/test Cosmos DB | DevOps (25%) |
| Frontend SPA | HTML/CSS/JS application | Implementation (25%) |
| CORS | Function App configuration | Implementation (25%) |
| Static Hosting | Azure Storage | Deployment (25%) |
| Integration | Frontend ↔ Backend | Testing (15%) |

| Lab 4 Concept | Implementation | ICA Alignment |
|---------------|----------------|---------------|
| Event-Driven | Event Grid pub/sub | Architecture (20%) |
| Microservices | Decoupled services | Implementation (25%) |
| Async Communication | Event-based messaging | Architecture (20%) |

---

## 🚀 Next Steps

### For ICA Submission:
1. ✅ Complete all Lab 3 tasks and take screenshots
2. ✅ Test thoroughly and document issues
3. ✅ (Optional) Complete Lab 4 Event Grid
4. 📝 Write architecture section explaining:
   - Why separate environments (dev/test)
   - Benefits of CORS
   - Static hosting vs traditional hosting
   - Event-driven architecture benefits
5. 📝 Update deployment automation section
6. 📝 Add testing screenshots to demo section

### Still Needed for Full ICA:
- ❌ Authentication & Authorization (Auth0/JWT)
- ❌ Second microservice (Loans service)
- ❌ Email notifications
- ❌ C4 diagrams
- ❌ Complete CI/CD pipeline
- ❌ Full report (1500-2000 words)

---

## 💡 Tips for ICA Report

### Deployment Section:
- Explain separation of dev/test environments
- Show deployment scripts
- Discuss automation benefits

### Architecture Section:
- Include frontend architecture diagram
- Explain CORS and why it's needed
- Discuss static website hosting benefits
- (If done) Explain Event Grid architecture

### Testing Section:
- Include screenshots of frontend
- Show API integration working
- Demonstrate filtering functionality
- Show CORS headers in dev tools

---

**Good luck with your ICA!** 🎉

If you encounter issues, check the troubleshooting section above or refer back to individual task instructions.
