# ✅ Lab 1 Automated Setup - COMPLETE

## What I've Done For You

### 1. ✅ Fixed Code for Local Development
**File Modified**: [cdls-catalogue-svc/src/appServices.ts](cdls-catalogue-svc/src/appServices.ts)

**Change**: Updated `getDeviceRepo()` to automatically use `FakeDeviceRepository` when Cosmos DB is not configured.

**Why**: This allows you to test locally and deploy to Azure without needing a real Cosmos DB (saves costs during early development, following Lab 1 principles).

**How it works**:
- If `COSMOS_ENDPOINT` is not set or is set to fake value → uses FakeDeviceRepository
- If real Cosmos DB configured → uses CosmosDeviceRepository
- Logs which repository is being used (for observability)

---

### 2. ✅ Created Deployment Script
**File Created**: [deploy-to-azure.sh](deploy-to-azure.sh)

**What it does**:
- Logs you into Azure
- Creates Resource Group, Storage Account, Function App
- Configures environment variables
- Builds and deploys your code
- Shows you the live URLs to test

**How to use**:
1. Edit line 11: Change `UNIQUE_ID="ab47"` to your own ID
2. Run: `./deploy-to-azure.sh`
3. Follow prompts

---

### 3. ✅ Created Cleanup Script
**File Created**: [cleanup-azure.sh](cleanup-azure.sh)

**What it does**: Deletes all Azure resources to avoid charges

**How to use**: `./cleanup-azure.sh`

---

### 4. ✅ Created Step-by-Step Guide
**File Created**: [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md)

**Contains**:
- Complete instructions for local testing
- Postman testing steps
- Azure deployment walkthrough
- Screen recording instructions
- Pricing research questions
- Troubleshooting section
- Completion checklist

---

### 5. ✅ Created Testing Guide
**File Created**: [TESTING-GUIDE.md](TESTING-GUIDE.md)

**Contains**:
- How to test locally
- How to test on Azure
- Expected responses
- curl commands for quick testing
- Observability features to notice

---

### 6. ✅ Created Project README
**File Created**: [README.md](README.md)

**Contains**:
- Project structure overview
- Quick command reference
- Lab progress tracker
- Architecture overview
- Next steps

---

### 7. ✅ Verified Everything Works
- ✅ Dependencies installed
- ✅ TypeScript compiles successfully
- ✅ All tests pass (3/3)
- ✅ Code quality verified

---

## 🎯 What YOU Need to Do Now

I've automated everything I can, but you need to do these tasks yourself (they require your interaction):

### Task 1: Test Locally with Postman (10 minutes)
Follow [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md) - Task 1

**Steps**:
1. Run `cd /workspaces/Campus-Device-Loan-System/cdls-catalogue-svc && npm start`
2. Open Postman
3. Test `http://localhost:7071/api/Health`
4. Test `http://localhost:7071/api/GetDevices`
5. **Take screenshots** (you need these for ICA!)

---

### Task 2: Deploy to Azure (15 minutes)
Follow [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md) - Task 2

**Steps**:
1. Edit [deploy-to-azure.sh](deploy-to-azure.sh) line 11 (change UNIQUE_ID)
2. Run `./deploy-to-azure.sh`
3. Follow Azure login prompts
4. Wait for deployment to complete
5. Test the live URL in Postman
6. **Take screenshots** (you need these for ICA!)

---

### Task 3: Make Screen Recording (10 minutes)
Follow [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md) - Task 3

**Record**:
- Deployment command running
- Testing Azure endpoint in Postman
- Successful JSON response

**Duration**: 20-30 seconds

---

### Task 4: Research Pricing (5 minutes)
Follow [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md) - Task 4

Visit Azure Functions pricing page and answer the questions.
**You'll need these answers for your ICA report!**

---

### Task 5: Clean Up Resources (2 minutes)
Follow [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md) - Task 5

Run `./cleanup-azure.sh` when done testing.

---

## 📋 Lab 1 Completion Checklist

Use this checklist to confirm you're ready for Lab 2:

- [ ] Tested locally with `npm start`
- [ ] Tested endpoints in Postman (local)
- [ ] **Screenshot**: Postman showing successful local test
- [ ] Edited deploy-to-azure.sh with my unique ID
- [ ] Deployed to Azure successfully
- [ ] Tested Azure endpoint in Postman
- [ ] **Screenshot**: Postman showing successful Azure test
- [ ] **Video**: Screen recording of deployment + testing (20-30s)
- [ ] Answered pricing questions
- [ ] Cleaned up Azure resources
- [ ] All screenshots/videos saved for ICA submission

---

## 📂 Files Created/Modified

### Created:
- ✅ [deploy-to-azure.sh](deploy-to-azure.sh) - Automated Azure deployment
- ✅ [cleanup-azure.sh](cleanup-azure.sh) - Resource cleanup
- ✅ [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md) - Detailed step-by-step guide
- ✅ [TESTING-GUIDE.md](TESTING-GUIDE.md) - Testing instructions
- ✅ [README.md](README.md) - Project overview
- ✅ [LAB1-AUTOMATED-SETUP.md](LAB1-AUTOMATED-SETUP.md) - This file

### Modified:
- ✅ [cdls-catalogue-svc/src/appServices.ts](cdls-catalogue-svc/src/appServices.ts) - Graceful degradation

---

## 🎓 Lab 1 Learning Outcomes Achieved

| Learning Outcome | Status | Evidence |
|------------------|--------|----------|
| Dev container setup | ✅ Done | .devcontainer/devcontainer.json |
| Build Azure Function | ✅ Done | cdls-catalogue-svc/ |
| Run locally | ✅ Done | npm start works |
| Test with Postman | ⚠️ You do | Follow guide |
| Deploy to Azure | ⚠️ You do | Use deploy-to-azure.sh |
| Screen recording | ⚠️ You do | Follow guide |
| Understand pricing | ⚠️ You do | Research + answer questions |
| Clean up resources | ⚠️ You do | Use cleanup-azure.sh |

---

## ⏭️ Next Steps

1. **RIGHT NOW**: Open [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md)
2. **Follow Task 1**: Test locally with Postman
3. **Follow Task 2**: Deploy to Azure
4. **Follow Task 3**: Make screen recording
5. **Follow Task 4**: Answer pricing questions
6. **Follow Task 5**: Clean up resources

**When complete**, come back and say:
> "Lab 1 complete! I have screenshots and video. Ready for Lab 2!"

Then I'll guide you through Lab 2! 🚀

---

## 💡 What You're Learning

You're building the **DevOps & Deployment (25%)** and **Testing (15%)** parts of your ICA:

- ✅ Automated deployment using CLI
- ✅ Configuration management (environment variables)
- ✅ Health endpoints for monitoring
- ✅ Structured logging
- ✅ Local and cloud testing

This is foundational for the rest of your project!

---

**Good luck!** 🎉

If you hit any issues, check the Troubleshooting section in [LAB1-COMPLETION-GUIDE.md](LAB1-COMPLETION-GUIDE.md)
