# Campus Device Loan System - Complete Project Todo List

**Deadline:** Tuesday 6th January 2026, 4:00 PM  
**Days Remaining:** 4 days  
**Total Tasks:** 63

---

## 📐 Architecture & Design (Tasks 1-4)

### Task 1: Create C4 Context Diagram
- [ ] Show users (students, staff, unauthenticated), the system boundary, and external systems (Auth0)
- [ ] Use draw.io or similar tool
- [ ] Save to `docs/diagrams/c4-context.png`

### Task 2: Create C4 Container Diagram
- [ ] Show Frontend SPA, Device Catalogue Service, Loan Service, Email Notification Service
- [ ] Show Cosmos DBs, Event Grid Topic
- [ ] Include technologies, protocols (HTTP/JSON), and connectivity
- [ ] Save to `docs/diagrams/c4-container.png`

### Task 3: Create Deployment Diagram
- [ ] Show Azure resources: Function Apps, Cosmos DBs, Storage Account (static site)
- [ ] Include Event Grid, Application Insights, Log Analytics
- [ ] Show regions and resource groups
- [ ] Save to `docs/diagrams/deployment.png`

### Task 4: Create Development Plan Diagram
- [ ] Annotate C4 Container diagram with build order (1-2-3)
- [ ] Mark MVP components
- [ ] Show which connections are faked/mocked
- [ ] Get tutor approval
- [ ] Save to `docs/diagrams/development-plan.png`

---

## 🔷 Device Catalogue Service (Tasks 5-10)

### Task 5: Domain Layer
- [ ] Create `src/domain/device.ts` with Device type and validation
- [ ] Create `src/domain/device-repo.ts` interface (list, getById, save)
- [ ] Pure TypeScript, no dependencies

### Task 6: Fake Repository
- [ ] Create `src/infra/fake-device-repo.ts` with in-memory array
- [ ] Add 5+ sample devices (laptops, tablets, cameras with different brands/models)
- [ ] Implements DeviceRepo interface

### Task 7: Application Layer
- [ ] Create `src/app/list-devices.ts` use case
- [ ] Create `src/app/get-device.ts` use case
- [ ] Create `src/config/appServices.ts` with getDeviceRepo() returning fake implementation
- [ ] Use deps pattern

### Task 8: Initialize Azure Functions
- [ ] Run `func init . --worker-runtime node --language typescript` in device-catalogue-service folder
- [ ] Verify host.json, package.json created

### Task 9: HTTP Endpoints
- [ ] Create `src/functions/list-devices-http.ts` (GET /devices)
- [ ] Create `src/functions/get-device-http.ts` (GET /devices/{id})
- [ ] Wire to app layer
- [ ] Include error handling

### Task 10: Local Testing ✅
- [ ] Run `npm install && npm start` (port 7071)
- [ ] Test GET /api/devices in browser and Postman
- [ ] Verify JSON response with device list
- [ ] Test GET /api/devices/{id}

---

## 🔶 Loan Service (Tasks 11-16)

### Task 11: Domain Layer
- [ ] Create `src/domain/loan.ts` (id, userId, deviceId, deviceModel, reservedAt, collectedAt, returnedAt, dueDate, status)
- [ ] Create `src/domain/loan-repo.ts` interface
- [ ] Add validation for 2-day loan period

### Task 12: Fake Infrastructure
- [ ] Create `src/infra/fake-loan-repo.ts` (in-memory loans array)
- [ ] Create `src/infra/fake-event-publisher.ts` (logs to console)
- [ ] Create `src/infra/fake-device-client.ts` (calls localhost:7071)
- [ ] Implement all interfaces

### Task 13: Application Layer
- [ ] Create `src/app/reserve-device.ts` (check availability, create loan, publish event)
- [ ] Create `src/app/collect-device.ts`
- [ ] Create `src/app/return-device.ts`
- [ ] Include concurrency checks

### Task 14: Initialize Azure Functions
- [ ] Run `func init . --worker-runtime node --language typescript` in loan-service folder
- [ ] Update package.json start script to use `--port 7072`

### Task 15: HTTP Endpoints
- [ ] Create POST /loans/reserve
- [ ] Create POST /loans/{id}/collect
- [ ] Create POST /loans/{id}/return
- [ ] Wire up `src/config/appServices.ts`
- [ ] Add good error handling and validation

### Task 16: Local Testing ✅
- [ ] Run `npm start` (port 7072)
- [ ] Test reserve device with Postman
- [ ] Verify availability decreases in Device Catalogue
- [ ] Test collection and return
- [ ] Try concurrent reservations

---

## 🔸 Email Notification Service (Tasks 17-22)

### Task 17: Domain Layer
- [ ] Create `src/domain/notification.ts` with email templates
- [ ] Add reservationConfirmation() function
- [ ] Add collectionConfirmation() function
- [ ] Add returnConfirmation() function
- [ ] Add deviceAvailable() function
- [ ] Pure functions returning subject/body

### Task 18: Fake Email Sender
- [ ] Create `src/infra/fake-email-sender.ts`
- [ ] Logs email details (to, subject, body) to console
- [ ] Implements EmailSender interface

### Task 19: Application Layer
- [ ] Create `src/app/send-notification.ts` use case
- [ ] Takes event data, selects template, generates email, sends
- [ ] Wire up `src/config/appServices.ts`

### Task 20: Initialize Azure Functions
- [ ] Run `func init . --worker-runtime node --language typescript` in email-notification-service folder
- [ ] Update package.json start script to use `--port 7073`

### Task 21: HTTP Event Handler
- [ ] Create POST /handle-event
- [ ] Receives loan events (reserved, collected, returned)
- [ ] Triggers appropriate email
- [ ] Parse event type and payload

### Task 22: Local Testing ✅
- [ ] Run `npm start` (port 7073)
- [ ] POST test events to /handle-event
- [ ] Verify emails logged to console with correct content for each event type

---

## 🌐 Frontend (Tasks 23-25)

### Task 23: Create HTML Interface ✅
- [x] Create `frontend/index.html`
- [x] Add device list (fetch from :7071/api/devices)
- [x] Add reservation form (POST to :7072/api/loans/reserve)
- [x] Add basic CSS
- [x] Include sign-in placeholder

### Task 24: Local Integration Test
- [ ] Open index.html in browser
- [ ] Verify device list loads
- [ ] Reserve a device
- [ ] Check all 3 service terminals show activity
- [ ] Confirm email logged to console

### Task 25: ✅ Local Development Complete - Full Flow Test
- [ ] Run all 3 services simultaneously
- [ ] Complete flow: Browse devices → Reserve → Availability decreases → Email sent
- [ ] Everything works locally without Azure!

---

## 🧪 Unit Testing (Tasks 26-29)

### Task 26: Add Vitest to Device Catalogue
- [ ] Install vitest
- [ ] Add vitest.config.ts
- [ ] Update package.json scripts
- [ ] Create `src/domain/device.test.ts` testing validation
- [ ] Create `src/app/list-devices.test.ts` with mock repo

### Task 27: Add Vitest to Loan Service
- [ ] Install vitest
- [ ] Create `src/domain/loan.test.ts` testing 2-day validation
- [ ] Create `src/app/reserve-device.test.ts` testing concurrency handling with mock repos

### Task 28: Add Vitest to Email Service
- [ ] Install vitest
- [ ] Create `src/domain/notification.test.ts` testing email templates
- [ ] Create `src/app/send-notification.test.ts` with mock email sender

### Task 29: Run All Unit Tests Locally
- [ ] Run `npm test` in all 3 services
- [ ] Verify all tests pass
- [ ] Run `npm run test:coverage` to check coverage
- [ ] Aim for >80% coverage on domain and app layers

---

## ☁️ Azure Infrastructure & Deployment (Tasks 30-40)

### Task 30: Setup Auth0 Account
- [ ] Create Auth0 account
- [ ] Create Single Page Application
- [ ] Create API with identifier (audience)
- [ ] Configure callback URLs for local (http://localhost:5173)
- [ ] Create test users with student and staff roles

### Task 31: Provision Azure Dev Environment
- [ ] Create resource group 'device-loan-dev-{uid}-rg'
- [ ] Create Cosmos DB serverless accounts for devices and loans
- [ ] Create Event Grid topic
- [ ] Create Log Analytics workspace

### Task 32: Create Cosmos DB Adapters
- [ ] Create `src/infra/cosmos-device-repo.ts`
- [ ] Create `src/infra/cosmos-loan-repo.ts`
- [ ] Use environment variables for config
- [ ] Support both access key and managed identity auth

### Task 33: Create Event Grid Publisher
- [ ] Create `src/infra/event-grid-publisher.ts` in loan-service
- [ ] Publishes events to Azure Event Grid
- [ ] Use environment variable for topic endpoint and key

### Task 34: Add Real Email Sender (SendGrid)
- [ ] Create `src/infra/sendgrid-email-sender.ts`
- [ ] Install @sendgrid/mail
- [ ] Use API key from environment
- [ ] Implements same EmailSender interface as fake

### Task 35: Update Config for Azure
- [ ] Update all `src/config/appServices.ts`
- [ ] Switch between fake and real implementations based on environment variables
- [ ] Use fake if COSMOS_KEY not set

### Task 36: Provision Azure Test Environment
- [ ] Create resource group 'device-loan-test-{uid}-rg'
- [ ] Create 3 Function Apps (one per service)
- [ ] Create Storage Accounts
- [ ] Create Cosmos DBs
- [ ] Create Event Grid
- [ ] All serverless/consumption

### Task 37: Deploy Device Catalogue to Test
- [ ] Configure Function App env vars (COSMOS_ENDPOINT, COSMOS_KEY, etc)
- [ ] Run `npm run build && func azure functionapp publish`
- [ ] Test live endpoint in Postman

### Task 38: Deploy Loan Service to Test
- [ ] Configure env vars including DEVICE_CATALOGUE_BASE_URL, EVENT_GRID_ENDPOINT
- [ ] Deploy
- [ ] Test reservation flow against live services

### Task 39: Deploy Email Service to Test
- [ ] Configure env vars including SENDGRID_API_KEY
- [ ] Deploy
- [ ] Create Event Grid subscription pointing to this function
- [ ] Test end-to-end event flow

### Task 40: Deploy Frontend to Azure Storage
- [ ] Create Storage Account with static website enabled
- [ ] Build frontend with production API URLs in .env
- [ ] Upload to $web container
- [ ] Configure CORS on Function Apps

---

## 🔐 Security (Tasks 41-44)

### Task 41: Add Auth0 to Frontend
- [ ] Install @auth0/auth0-spa-js
- [ ] Add login/logout buttons
- [ ] Store JWT token
- [ ] Send Authorization header with all API requests
- [ ] Show user role (student/staff)

### Task 42: Add JWT Validation to Services
- [ ] Add middleware to verify JWT tokens from Auth0
- [ ] Check role claims for RBAC (students can reserve, staff can collect/return)
- [ ] Return 403 for unauthorized actions

### Task 43: Add Function Keys for Service-to-Service
- [ ] Configure Loan Service to call Device Catalogue with function key
- [ ] Store key in environment variables
- [ ] Test secured service-to-service communication

### Task 44: Test Security End-to-End
- [ ] Test unauthenticated access (should see devices but not reserve)
- [ ] Test student role (can reserve)
- [ ] Test staff role (can collect/return)
- [ ] Test 403 responses

---

## 📊 Observability (Tasks 45-48)

### Task 45: Add Application Insights to All Services
- [ ] Create Application Insights instance
- [ ] Add APPINSIGHTS_INSTRUMENTATIONKEY to all Function App settings
- [ ] Add custom telemetry logging to critical paths

### Task 46: Configure Log Analytics Workspace
- [ ] Create Log Analytics workspace for test environment
- [ ] Connect all Application Insights to it
- [ ] Test KQL queries to trace requests across services using OperationId

### Task 47: Add Health Endpoints
- [ ] Add GET /health endpoint to each service returning 200 OK and version info
- [ ] Add readiness checks (can connect to Cosmos, etc)

### Task 48: Create Alert Rule
- [ ] Create at least one alert in Azure Monitor
- [ ] Example: alert when reservation fails >5 times in 5 minutes
- [ ] Configure email notification

---

## 🚀 CI/CD Pipeline (Tasks 49-57)

### Task 49: Create GitHub Repo and Push Code
- [ ] Create 3 private GitHub repos (one per service) or 1 monorepo
- [ ] Push all code
- [ ] Create .gitignore to exclude node_modules, dist, local.settings.json
- [ ] Initial commit

### Task 50: Add CI Build Workflow - Device Catalogue
- [ ] Create `.github/workflows/build.yml`
- [ ] On push: npm install, npm run build, npm test
- [ ] Verify workflow runs and passes on GitHub

### Task 51: Add CI Build Workflow - Loan Service
- [ ] Create `.github/workflows/build.yml` for loan service
- [ ] Same steps: install, build, test
- [ ] Verify passes

### Task 52: Add CI Build Workflow - Email Service
- [ ] Create `.github/workflows/build.yml` for email service
- [ ] Same steps: install, build, test
- [ ] Verify passes

### Task 53: Upgrade to CI/CD - Auto Deploy to Test
- [ ] Replace build.yml with build-and-deploy.yml for all services
- [ ] Add Azure credentials as GitHub secrets
- [ ] Auto-deploy to test environment on push to main branch

### Task 54: Add Gated Production Deployment
- [ ] Create production environment in Azure
- [ ] Add manual approval workflow for production deployment
- [ ] Only deploys when manually triggered from main branch

### Task 55: Test CI/CD Pipeline End-to-End
- [ ] Make code change, commit, push
- [ ] Verify: GitHub Action runs, tests pass, deploys to test automatically
- [ ] Verify production deployment waits for approval
- [ ] Approve and verify production deploy

### Task 56: Add Integration Tests to Frontend
- [ ] Create tests/integration folder
- [ ] Add tests that call deployed Test environment APIs
- [ ] Test device list, reservation flow, authentication flow

### Task 57: Run Integration Tests in CI/CD
- [ ] Add integration test step to workflow after deploy-to-test
- [ ] Tests run against deployed test environment
- [ ] Fail deployment if integration tests fail

---

## 📹 Demo & Documentation (Tasks 58-60)

### Task 58: Capture Screenshots
- [ ] Take high-res screenshots of:
  - Device list (unauthenticated)
  - Device list with availability (authenticated)
  - Reservation form
  - Confirmation
  - Role-based access (403 error)
  - Application Insights traces

### Task 59: Record Video Demos
- [ ] Use OBS to record 20-30s clips:
  - Device browsing
  - Reservation flow
  - Collection/return by staff
  - Notification evidence (email)
  - CI/CD pipeline running
- [ ] Total video duration <5 minutes

### Task 60: Write Technical Report (1500-2000 words)
- [ ] Explain technology choices (TypeScript, Azure Functions, Cosmos DB, Event Grid)
- [ ] Document trade-offs (serverless vs containers, NoSQL vs SQL)
- [ ] Reflect on consequences (cost, scalability, security)
- [ ] Include critical thinking and ownership of decisions

---

## 🎯 Final Submission (Tasks 61-63)

### Task 61: Prepare Submission Package
- [ ] Create ZIP file with:
  - Media/ folder (screenshots, videos)
  - Source/ folder (all code, cleaned - delete node_modules, dist, bin, obj)
  - Documentation/ folder (diagrams, report)
- [ ] Add README with name and user ID in root

### Task 62: Final Testing and Review
- [ ] Test full system end-to-end in production
- [ ] Review all diagrams for completeness
- [ ] Proofread report
- [ ] Check all assessment criteria covered
- [ ] Verify submission package is complete
- [ ] Verify file size <100MB

### Task 63: ✅ Submit to Blackboard
- [ ] Upload ZIP file to Blackboard
- [ ] Verify upload successful
- [ ] Check file size <100MB (if needed, reduce video quality)
- [ ] **Submit before Tuesday 6th January 2026, 4:00 PM deadline!**

---

## Progress Tracking

**Current Phase:** Local Development  
**Tasks Completed:** 0 / 63  
**Progress:** 0%

### Milestones
- [ ] **Milestone 1:** Local Development Complete (Tasks 1-25)
- [ ] **Milestone 2:** Unit Testing Complete (Tasks 26-29)
- [ ] **Milestone 3:** Azure Deployment Complete (Tasks 30-40)
- [ ] **Milestone 4:** Security & Observability Complete (Tasks 41-48)
- [ ] **Milestone 5:** CI/CD Complete (Tasks 49-57)
- [ ] **Milestone 6:** Demo & Docs Complete (Tasks 58-60)
- [ ] **Milestone 7:** Submission Ready (Tasks 61-63)

---

## Key Checkpoints

✅ **After Task 10:** Device Catalogue Service working locally  
✅ **After Task 16:** Loan Service working locally  
✅ **After Task 22:** Email Service working locally  
✅ **After Task 25:** All services integrated and tested locally  
✅ **After Task 29:** All unit tests passing  
✅ **After Task 44:** Security fully implemented  
✅ **After Task 57:** Full CI/CD pipeline operational  
✅ **After Task 63:** Submission complete!

---

**Last Updated:** January 2, 2026  
**Status:** Ready to begin development
