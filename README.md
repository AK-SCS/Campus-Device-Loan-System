# Campus Device Loan System

Cloud Native DevOps (CIS3039-N) Assessment Project

## Overview
A microservices-based system for managing device loans (laptops, tablets, cameras) for students.

## Architecture

### Services
```
┌─────────────────────┐
│   Frontend (SPA)    │
│  - Browse devices   │
│  - Reserve devices  │
│  - View loans       │
└──────────┬──────────┘
           │
           ├──────────────────┬─────────────────────┐
           │                  │                     │
    ┌──────▼──────┐   ┌──────▼──────┐    ┌────────▼────────┐
    │   Device    │   │    Loan     │    │  Notification   │
    │  Catalogue  │   │   Service   │    │    Service      │
    │   Service   │   │             │    │                 │
    │  (Port 7071)│   │ (Port 7072) │    │  (Port 7073)    │
    └─────────────┘   └──────┬──────┘    └─────────────────┘
                             │
                             │ Events
                             └──────────────────────────────►
```

### Technology Stack
- **Runtime**: Node.js + TypeScript
- **Serverless**: Azure Functions v4
- **Database**: Cosmos DB (NoSQL)
- **Events**: Event Grid (async communication)
- **Auth**: Auth0 (JWT with role claims)
- **DevOps**: GitHub Actions
- **Container**: Docker Dev Containers

## Project Structure
```
Campus-Device-Loan-System/
├── device-catalogue-service/    # Manages device inventory
├── loan-service/                # Handles reservations & returns
├── email-notification-service/  # Sends email notifications
├── frontend/                    # (To be added) Web interface
├── lab-sheets/                  # Reference materials
└── README.md
```

## Local Development

### Prerequisites
- Docker Desktop (running)
- VS Code with Dev Containers extension
- Git

### Quick Start

**Option 1: Run all services**
```bash
# Terminal 1 - Device Catalogue
cd device-catalogue-service
npm install
npm start  # Runs on http://localhost:7071

# Terminal 2 - Loan Service
cd loan-service
npm install
npm start  # Runs on http://localhost:7072

# Terminal 3 - Email Notification
cd email-notification-service
npm install
npm start  # Runs on http://localhost:7073
```

**Option 2: Open each service in its own VS Code window**
1. Open `device-catalogue-service` folder in VS Code
2. Reopen in Container when prompted
3. Run `npm install && npm start`
4. Repeat for other services

### Testing Locally
All services use **fake implementations** by default (no Azure credentials needed):
- Fake device repository (in-memory data)
- Fake loan repository (in-memory data)
- Fake email sender (console logging)
- Fake event publisher (console logging)

Perfect for rapid development and testing!

## Deployment

### Environments
- **dev**: Local development (fake implementations)
- **test**: Azure deployment (automated via GitHub Actions)
- **staging**: Azure deployment (manual approval required)
- **production**: Azure deployment (manual approval required)

Deployment instructions will be added after local development is complete.

## Assessment Requirements Checklist

### Architecture & Design (25%)
- [x] C4 diagrams (Context, Container, Deployment)
- [x] Requirements mapped to containers
- [ ] Security annotations
- [x] Stateless design
- [x] Async flows with Event Grid

### Implementation & Tools (25%)
- [x] Frontend + multiple backend services
- [ ] Secure endpoints (OIDC/JWT, RBAC)
- [ ] Resilient design (retries, fault handling)
- [x] Industry-standard frameworks
- [x] Clean config management

### Testing & Verification (15%)
- [ ] Automated unit + integration tests
- [ ] Concurrency/idempotency testing
- [ ] Mocks/fakes used effectively
- [ ] Tests run in CI

### DevOps & Deployment (25%)
- [ ] Full CI/CD workflow
- [ ] Automated deploy to Test
- [ ] Gated deploy to Staging/Production
- [ ] Observability (logs, health, metrics, alerts)
- [ ] Scalability demonstration

### Report (10%)
- [ ] Technical decisions explained
- [ ] Trade-offs documented
- [ ] Consequences reflected upon

## Development Progress

**Phase 1: Local Development** ✅ (In Progress)
- [x] Project structure created
- [x] Dev containers configured
- [ ] Domain models implemented
- [ ] Use cases implemented
- [ ] HTTP endpoints implemented
- [ ] Local integration testing

**Phase 2: Azure Deployment** (Upcoming)
- [ ] Cosmos DB provisioned
- [ ] Function Apps deployed
- [ ] Event Grid configured
- [ ] Auth0 configured
- [ ] CI/CD pipelines created

**Phase 3: Testing & Polish** (Upcoming)
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Observability configured
- [ ] Documentation completed
- [ ] Demo media captured

## Timeline
- **Deadline**: Tuesday 6th January 2026, 4:00 PM
- **Current Date**: January 2, 2026
- **Days Remaining**: 4 days

## Contact
Student: [Your Name]
Module: CIS3039-N Cloud Native DevOps
