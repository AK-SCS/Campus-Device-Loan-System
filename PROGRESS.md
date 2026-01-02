# Campus Device Loan System - Development Progress

## Project Overview
**ICA Specification:** Cloud Native DevOps (CIS3039-N)  
**Deadline:** Tuesday 6th January 2026, 4:00pm  
**GitHub Repository:** https://github.com/AK-SCS/Campus-Device-Loan-System

---

## ✅ Completed Labs & Implementation

### Week 1: Hello Cloud - Azure Functions Basics
**Status:** Complete  
**Date:** January 2, 2026

**What We Learned:**
- Dev container setup with Node.js, TypeScript, Azure CLI, Azure Functions Core Tools
- Azure Functions initialization and local testing
- Azure account setup and provider registration

**Key Takeaways:**
- `func init . --typescript` - Initialize Functions project
- `func new --name <name> --template "HTTP trigger"` - Create new function
- `npm start` - Run locally on port 7071
- Azure provider registration (one-time setup completed)

---

### Week 3: Architecture Design
**Status:** Skipped (to be done at end)  
**Reason:** All diagrams will be created together after implementation

**To Complete Later:**
- C4 Context Diagram
- C4 Container Diagram with collaboration stories
- Event-driven annotations (optional)
- Deployment Diagram
- Development Plan Diagram

---

### Week 4: First Microservice - Device Catalogue Service
**Status:** Complete  
**Date:** January 2, 2026

#### Azure Resources Provisioned
- **Resource Group:** `device-loan-dev-cdls01-rg` (Sweden Central)
- **Cosmos DB Account:** `device-loan-dev-cdls01-cosmos` (Serverless mode)
- **Database:** `devices-db`
- **Container:** `devices` (partition key: `/id`)

#### Implementation Details

**Domain Layer:**
- ✅ `Device` entity (`src/domain/device.ts`)
  - Fields: id, brand, model, category, totalCount, availableCount
  - Factory function: `createDevice()` with validation
- ✅ `DeviceRepo` interface (`src/domain/device-repo.ts`)
  - Methods: create, get, list, update

**Infrastructure Layer:**
- ✅ `CosmosDeviceRepo` (`src/infra/cosmos-device-repo.ts`)
  - Implements all DeviceRepo methods
  - Supports access-key and managed identity auth
  - Separate DTO type from domain model

**Application Layer:**
- ✅ `listDevices` (`src/app/list-devices.ts`)
- ✅ `getDevice` (`src/app/get-device.ts`)
- ✅ `updateDeviceAvailability` (`src/app/update-device-availability.ts`)

**HTTP Endpoints:**
- ✅ GET `/api/devices` - List all devices with availability
- ✅ GET `/api/devices/{id}` - Get single device by ID
- ✅ PATCH `/api/devices/{id}/availability` - Update device availability

**Configuration:**
- ✅ Dependency injection via `appServices.ts`
- ✅ Environment variable for COSMOS_KEY

**Data Seeding:**
- ✅ Test data with 5 devices (laptops, tablets, camera)
- ✅ Seed script: `npm run seed`

---

## 📋 Project Structure

```
Campus-Device-Loan-System/
├── .devcontainer/
│   └── devcontainer.json          # DevOps Starter Kit image
├── src/
│   ├── domain/
│   │   ├── device.ts              # Device entity & validation
│   │   └── device-repo.ts         # Repository interface
│   ├── infra/
│   │   └── cosmos-device-repo.ts  # Cosmos DB implementation
│   ├── app/
│   │   ├── list-devices.ts        # List devices use case
│   │   ├── get-device.ts          # Get device use case
│   │   └── update-device-availability.ts  # Update availability use case
│   ├── functions/
│   │   ├── list-devices-http.ts   # GET /api/devices
│   │   ├── get-device-http.ts     # GET /api/devices/{id}
│   │   └── update-device-availability-http.ts  # PATCH /api/devices/{id}/availability
│   ├── config/
│   │   └── appServices.ts         # Dependency resolution
│   └── seed/
│       ├── test-data.ts           # Sample device data
│       └── seed.ts                # Database seeding script
├── package.json
├── tsconfig.json
└── host.json
```

---

## 🔧 Local Development Commands

```bash
# Build TypeScript
npm run build

# Start Azure Functions locally
npm start
# Access at: http://localhost:7071/api/devices

# Seed database
export COSMOS_KEY=$(az cosmosdb keys list --resource-group device-loan-dev-cdls01-rg --name device-loan-dev-cdls01-cosmos --query primaryMasterKey -o tsv)
npm run seed

# Git operations
git add .
git commit -m "message"
git push
```

---

## 🎯 ICA Requirements Mapping

### Architecture & Design (25%)
- ⏳ C4 Context Diagram - **To be done**
- ⏳ C4 Container Diagram - **To be done**
- ⏳ Deployment Diagram - **To be done**
- ⏳ Development Plan - **To be done**

### Implementation & Tools (25%)
- ✅ Backend service (Device Catalogue)
- ⏳ Frontend web page
- ⏳ Second backend service (Reservation/Notification)
- ⏳ Secure endpoints (OAuth2/JWT, RBAC)
- ⏳ Resilience features
- ✅ Industry-standard frameworks (Azure Functions, Cosmos DB)
- ✅ Clean configuration management (env vars)

### Testing & Verification (15%)
- ⏳ Automated unit tests
- ⏳ Integration tests
- ⏳ Concurrency/idempotency testing
- ⏳ Mocks/fakes
- ⏳ Tests in CI

### DevOps & Deployment (25%)
- ⏳ CI/CD workflow
- ⏳ Automated deploy to Test
- ⏳ Gated deploy to Staging/Production
- ⏳ Observability (logs, health, metrics, alerts)
- ⏳ IaC (at least one resource)
- ⏳ Scalability demonstration

### Report (10%)
- ⏳ 1500-2000 words
- ⏳ Technical decisions explained
- ⏳ Trade-offs and consequences
- ⏳ Security, scalability, resilience, maintainability

---

## 📝 Scenario Requirements Status

### Unauthenticated Users
- ✅ Browse devices (brand, model, category)

### Registered Users  
- ✅ View devices with availability count
- ⏳ Securely sign in (Auth0)
- ⏳ Reserve device for collection
- ⏳ Subscribe for device availability notifications

### Staff
- ⏳ Mark devices as collected
- ⏳ Mark devices as returned

### System Features
- ✅ Multiple devices per model supported
- ⏳ 2-day loan duration
- ⏳ Email notifications (collection, return, waitlist)
- ⏳ Concurrency handling for reservations

### Non-Functional Requirements
- ⏳ JWT-based auth with role claim
- ⏳ TLS for external traffic
- ⏳ Auth0 integration
- ⏳ RBAC backend
- ⏳ Reservation concurrency handling
- ⏳ Graceful degradation
- ⏳ Self-healing
- ⏳ Structured logs with correlation IDs
- ⏳ Health/readiness endpoints
- ⏳ Metrics and alerts
- ✅ Stateless services
- ⏳ Serverless architecture
- ⏳ Automated tests
- ⏳ CI/CD pipeline

---

## 🚀 Next Steps

### Immediate (Lab Sheets to Complete)
1. **Next Lab Sheet** - Continue learning implementation techniques
2. **Additional Services:**
   - Reservation Service (device reservations, loan management)
   - Notification Service (email notifications, waitlist)
   - Authentication integration (Auth0)
3. **Frontend:** Web application
4. **Testing:** Unit, integration, concurrency tests
5. **DevOps:** CI/CD pipeline, observability, IaC

### Before Submission (January 6, 2026)
1. **Architecture Diagrams:** All C4 diagrams and deployment diagram
2. **Development Plan Diagram:** Build order and MVP annotation
3. **Demo Media:** Screenshots + video clips (< 5 min total)
4. **Report:** 1500-2000 words on technical decisions
5. **Clean Submission:** ZIP with Media/, Source/, Documentation/

---

## 📊 Progress Summary

**Completion:** ~15%  
**Services Built:** 1/3 minimum (Device Catalogue complete)  
**Core Features:** Device browsing ✅, Reservations ⏳, Notifications ⏳  
**Azure Resources:** Resource group, Cosmos DB provisioned  
**Time Remaining:** 4 days to deadline

---

## 🔑 Important Notes

- **Unique Identifier:** `cdls01` (Campus Device Loan System 01)
- **Azure Region:** Sweden Central (allowed region for subscription)
- **Naming Convention:** `project-env-uid-type` (kebab-case)
- **Git Commits:** Regular commits after each stage completion
- **No Hardcoded Secrets:** All keys via environment variables

---

**Last Updated:** January 2, 2026
