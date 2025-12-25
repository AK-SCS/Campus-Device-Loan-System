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
- [ ] **YOU NEED TO DO**: Deploy to Azure using `./deploy-to-azure.sh`
- [ ] **YOU NEED TO DO**: Test with Postman and take screenshots
- [ ] **YOU NEED TO DO**: Make screen recording
- [ ] **YOU NEED TO DO**: Clean up resources

**Next**: See [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md) for detailed instructions!

### Lab 2: (Not started yet)
Waiting for you to complete Lab 1 tasks...

## 🏗️ Current Architecture

**Implemented:**
- ✅ One backend service: Catalogue Service
- ✅ Clean architecture (Domain → Application → Infrastructure)
- ✅ Repository pattern with Fake implementation
- ✅ Structured logging with correlation IDs
- ✅ Health and Readiness endpoints
- ✅ Automated testing (unit tests)
- ✅ CI pipeline (GitHub Actions)

**Still Needed (from ICA specification):**
- ❌ Frontend web page
- ❌ Second backend service (Loan/Reservation service)
- ❌ Authentication & Authorization (Auth0, JWT, RBAC)
- ❌ Real Cosmos DB database
- ❌ Email notification service
- ❌ CI/CD pipeline (deployment automation)
- ❌ Infrastructure as Code
- ❌ C4 diagrams
- ❌ Development plan

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
