# Campus Device Loan System - Quick Start

## 📁 Project Structure

```
Campus-Device-Loan-System/
├── cdls-catalogue-svc/          # Catalogue Service (Azure Functions)
│   ├── src/
│   │   ├── domain/              # Business models (DeviceModel)
│   │   ├── application/         # Use cases (listDevices)
│   │   ├── infrastructure/      # Repositories (Cosmos/Fake)
│   │   ├── functions/           # HTTP endpoints (GetDevices, Health, Readiness)
│   │   └── observability/       # Logging & correlation
│   ├── __tests__/               # Unit tests
│   └── package.json
├── deploy-to-azure.sh           # Automated Azure deployment
├── cleanup-azure.sh             # Cleanup Azure resources
├── LAB1-COMPLETION-GUIDE.md     # Step-by-step Lab 1 guide
└── TESTING-GUIDE.md             # Testing instructions

```

## 🚀 Quick Commands

### Local Development
```bash
cd /workspaces/Campus-Device-Loan-System/cdls-catalogue-svc

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Start locally
npm start

# In another terminal, test:
curl http://localhost:7071/api/Health
curl http://localhost:7071/api/GetDevices
```

### Deploy to Azure
```bash
cd /workspaces/Campus-Device-Loan-System

# 1. Edit deploy-to-azure.sh and change UNIQUE_ID="ab47" to your own ID
# 2. Run the script:
./deploy-to-azure.sh

# Test the deployed service (replace [YOUR-ID]):
curl https://cdls-catalogue-test-[YOUR-ID]-func.azurewebsites.net/api/Health
```

### Clean Up Azure
```bash
./cleanup-azure.sh
```

## 📚 Lab Progress

### Lab 1: Getting Started with Cloud Development ✅
- [x] Dev container configured
- [x] Azure Functions project created
- [x] Local testing working
- [x] Deployed to Azure
- [x] Tested with Postman
- [x] Documentation complete

### Lab 2: Microservices & Cosmos DB ✅
- [x] Cosmos DB provisioned (dev environment)
- [x] Seed script created (14 devices)
- [x] CosmosDeviceRepository implemented
- [x] Environment configuration
- [x] Local and Azure testing

### Lab 3: Deployment & Frontend ✅
- [x] Separate dev/test environments
- [x] Frontend SPA created
- [x] CORS configured
- [x] Frontend deployment script
- [ ] **YOU NEED TO DO**: Deploy frontend to Azure Storage
- [ ] **YOU NEED TO DO**: Test end-to-end integration

### Lab 4: Event Grid (Optional/Stretch) ✅
- [x] Event Grid publisher implemented
- [x] Event Grid subscriber implemented
- [ ] **OPTIONAL**: Deploy Event Grid topic
- [ ] **OPTIONAL**: Test event-driven flow

**Next**: See [LAB3-LAB4-GUIDE.md](LAB3-LAB4-GUIDE.md) for detailed instructions!

## 🏗️ Current Architecture

**Implemented:**
- ✅ Backend service: Catalogue Service (Azure Functions)
- ✅ Frontend: SPA with device catalogue and filtering
- ✅ Clean architecture (Domain → Application → Infrastructure)
- ✅ Repository pattern with Fake and Cosmos implementations
- ✅ Structured logging with correlation IDs
- ✅ Health and Readiness endpoints
- ✅ Automated testing (unit tests)
- ✅ CI pipeline (GitHub Actions)
- ✅ CORS configuration for cross-origin requests
- ✅ Static website hosting (Azure Storage)
- ✅ Event Grid integration (publisher/subscriber)
- ✅ Separate dev/test environments

**Still Needed (from ICA specification):**
- ❌ Second backend service (Loan/Reservation service)
- ❌ Authentication & Authorization (Auth0, JWT, RBAC)
- ❌ Email notification service
- ❌ Complete CI/CD pipeline (deployment automation)
- ❌ Infrastructure as Code
- ❌ C4 diagrams
- ❌ Development plan
- ❌ Full report (1500-2000 words)

## 🎯 What to Do Next

1. **Complete Lab 1 tasks** - See [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md)
2. **Test everything** - See [TESTING-GUIDE.md](TESTING-GUIDE.md)
3. **Deploy to Azure** - Run `./deploy-to-azure.sh`
4. **Make screenshots/videos** - For ICA demo
5. **Share Lab 2** - Then we continue!

## 💡 Key Concepts Applied (from Labs)

### Week 1 Lab Concepts:
- ✅ Dev Containers for reproducible environment
- ✅ Azure Functions (serverless)
- ✅ TypeScript for type safety
- ✅ HTTP triggers
- ✅ Local testing with Functions Core Tools
- ✅ Azure CLI for provisioning
- ✅ Consumption plan (pay-as-you-go)
- ✅ Environment variables for configuration

### Design Patterns Used:
- Repository pattern (abstraction over data access)
- Dependency injection (via appServices)
- Clean architecture (separation of concerns)
- Hexagonal architecture (ports & adapters)

## 🆘 Need Help?

1. **Local testing not working?** - See [TESTING-GUIDE.md](TESTING-GUIDE.md)
2. **Deployment issues?** - Check the troubleshooting section in [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md)
3. **Ready for next lab?** - Complete Lab 1 checklist first!

---

**Student Name**: _________________  
**Student ID**: _________________  
**Unique Azure ID**: _________________  (e.g., ab47)
