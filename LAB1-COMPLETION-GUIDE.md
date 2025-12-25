# Lab 1 Completion Guide: Testing & Deployment

This guide helps you complete Week 1 Lab requirements for the Campus Device Loan System.

## ✅ What's Already Done

- ✅ Dev container configured with Azure Functions Core Tools and Azure CLI
- ✅ Catalogue service built and tested
- ✅ Code updated to use FakeDeviceRepository when Cosmos DB is not configured
- ✅ Deployment scripts created

## 🎯 What You Need to Do

### Task 1: Test Locally (5 minutes)

**Step 1: Start the Function App**

Open a terminal and run:

```bash
cd /workspaces/Campus-Device-Loan-System/cdls-catalogue-svc
npm start
```

You should see output showing available endpoints:
```
Functions:
  GetDevices: [GET,POST] http://localhost:7071/api/GetDevices
  Health: [GET] http://localhost:7071/api/Health
  Readiness: [GET] http://localhost:7071/api/Readiness
```

**Step 2: Test in Browser**

Open these URLs in your browser:
- http://localhost:7071/api/Health
- http://localhost:7071/api/GetDevices

**Step 3: Test with Postman**

1. Open Postman (install the VS Code extension if needed)
2. Create a new GET request to: `http://localhost:7071/api/GetDevices`
3. Click **Send**
4. **Screenshot this!** (You'll need it for your ICA demo)
5. Try the Health endpoint: `http://localhost:7071/api/Health`

**Expected Results:**
- Health returns: `{"status":"ok","service":"cdls-catalogue-svc"}`
- GetDevices returns an array with 3 fake devices (Dell laptop, iPad, Canon camera)

**Step 4: Stop the Service**

In the terminal where `npm start` is running, press `Ctrl+C`

---

### Task 2: Deploy to Azure (15-20 minutes)

**Before you start:**
1. Open [deploy-to-azure.sh](deploy-to-azure.sh)
2. Change line 11: `UNIQUE_ID="ab47"` to your own unique identifier
   - Use your initials + numbers, e.g., `UNIQUE_ID="jd123"`
   - This ensures your Azure resource names don't conflict with others

**Deploy:**

```bash
cd /workspaces/Campus-Device-Loan-System
./deploy-to-azure.sh
```

The script will:
1. Prompt you to log in to Azure (follow browser prompts)
2. Create a Resource Group
3. Create a Storage Account
4. Create a Function App
5. Configure environment variables
6. Build and deploy your code

**What to expect:**
- The script takes 5-10 minutes
- You'll see progress messages for each step
- At the end, you'll see URLs to test

**Test your deployed service:**

Open in browser or Postman:
```
https://cdls-catalogue-test-[YOUR-ID]-func.azurewebsites.net/api/Health
https://cdls-catalogue-test-[YOUR-ID]-func.azurewebsites.net/api/GetDevices
```

**Screenshot these working!** ✨

---

### Task 3: Make a Screen Recording (10 minutes)

You need a short video (20-30 seconds) showing deployment and testing.

**Option 1: Using OBS (recommended for ICA)**
1. Open OBS Studio
2. Settings → Output → Recording Format = mp4
3. Add a Display Capture or Window Capture source
4. Start Recording
5. Show your terminal running the deployment command
6. Show Postman testing the live Azure endpoint
7. Show the JSON response
8. Stop Recording

**Option 2: Quick recording (for now)**
- Use your OS's built-in screen recorder:
  - **Windows**: Windows + G (Game Bar)
  - **Mac**: Shift + Command + 5
  - **Linux**: Kazam or SimpleScreenRecorder

**What to record:**
1. Terminal showing `func azure functionapp publish` command
2. Postman making a request to your Azure endpoint
3. The successful JSON response

Save the video - you'll need it for your ICA submission!

---

### Task 4: Understand Pricing (5 minutes)

Visit: https://azure.microsoft.com/en-gb/pricing/details/functions/

**Questions to answer** (you'll need these for your ICA report):

1. What does the free tier cover?
   - Answer: _______________

2. If you have 10,000 requests/day, what would you pay?
   - Answer: _______________

3. Why is serverless good for the Campus Device Loan System?
   - Answer: _______________

Write these answers down - they'll go in your ICA report under "technology choices and trade-offs"!

---

### Task 5: Clean Up Resources (2 minutes)

**IMPORTANT**: Don't forget to delete your Azure resources after testing!

```bash
cd /workspaces/Campus-Device-Loan-System
./cleanup-azure.sh
```

This deletes everything and stops any charges.

**To verify deletion:**
1. Go to https://portal.azure.com
2. Click "Resource groups"
3. Confirm your resource group is gone (or shows "Deleting...")

---

## ✅ Lab 1 Completion Checklist

Before moving to Lab 2, confirm you have:

- [ ] Tested catalogue service locally with Postman
- [ ] Deployed to Azure using the deployment script
- [ ] Tested the live Azure endpoint
- [ ] Made a screen recording showing deployment and testing
- [ ] Answered the pricing questions
- [ ] Saved screenshots of Postman tests (local AND Azure)
- [ ] Cleaned up Azure resources
- [ ] **Screenshots and videos saved** for ICA submission

---

## 🎓 What You Learned (Lab 1 → ICA Mapping)

| Lab 1 Learning Outcome | ICA Requirement | Status |
|------------------------|-----------------|--------|
| Build Azure Function locally | Implementation (25%) | ✅ |
| Test with Postman | Testing & Verification (15%) | ✅ |
| Deploy to Azure | DevOps & Deployment (25%) | ✅ |
| Screen recording | Demo & Report (10%) | ✅ |
| Understand pricing | Report - trade-offs | ✅ |

---

## 🆘 Troubleshooting

**"func: command not found"**
- Rebuild your dev container: Ctrl+Shift+P → "Dev Containers: Rebuild Container"

**"Storage account name already taken"**
- Change your UNIQUE_ID in deploy-to-azure.sh to something else

**"Cannot deploy to uksouth"**
- Run: `az policy assignment list --query "[?name.contains(@, 'sys.regionrestriction')].parameters.listOfAllowedLocations.value | []" -o tsv`
- Pick an allowed region and update LOCATION in deploy-to-azure.sh

**"npm start" doesn't show any output**
- Make sure you ran `npm install` and `npm run build` first
- Check for errors in the terminal

**Postman shows "Could not get response"**
- Make sure `npm start` is still running in a terminal
- Wait a few seconds after starting (Azure Functions takes ~10s to initialize)
- Try `curl http://localhost:7071/api/Health` in terminal first

---

## 📝 Next Steps

Once you've completed ALL the tasks above and have your screenshots/videos saved:

**Report back with:**
1. ✅ "Local testing works - I have Postman screenshots"
2. ✅ "Azure deployment works - I have the live URL"
3. ✅ "I have a screen recording"
4. ✅ "Resources cleaned up"

Then we'll move to **Lab 2**! 🚀
