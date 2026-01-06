# Dev Containers Azure Functions Postman OBS
# Hello Cloud: Week 1 Lab Worksheet
**Topic: Getting Started with Cloud Development**

## Learning Objectives
- Create an Azure student account.
- Set up the development environment and tools.
- Build and run a simple Azure Function locally.
- Explore how Functions can handle optional parameters using AI support.
- Test Functions using both GET and POST requests in Postman.
- Deploy your Function to Azure.
- Make a screen recording demonstrating your work.
- Understand the basics of free tier and pay-as-you-go cloud pricing.
- (Optional) Deploy using the Azure Portal and VS Code GUI.
- (Optional) Extend your Functions code.
- Clean up Azure resources after the lab.

## Stage 1 Create Your Azure Student Account
**Why:** You need a subscription so Azure can host your resources. The student offer gives credits to use without requiring a credit card.

1. Go to the Azure for Students page and click Start free.
2. Sign in with your university email (e.g., @tees.ac.uk).
3. Verify student status (automatic or ID upload) and accept terms.
4. Open portal.azure.com → search Subscriptions → confirm Azure for Students.

✅ **Checkpoint:** You have a working Azure student subscription.

### Troubleshooting
• Signed in with a personal email? Sign out and back in with your university account.
• Already claimed the offer? Renew if eligible; otherwise Free Trial (credit card required to prove identity but no spending necessary).
• Verification failing? Try an incognito window.

## Stage 2 Set up your development environment and tools
**Why:** Having a reproducible and common development environment (tools and configuration) allows reliable reproduction of lab exercises and eases assessment work.

### Step 2a – Git
- **Campus:** run Git from AppsAnywhere. Be sure to do this before starting VS Code.
- **Home:** install from git-scm.com.

Verify installation using a bash terminal:
```bash
git --version
```

### Step 2b – Docker Desktop
- **Campus:** start Docker Desktop. Be sure to do this before starting VS Code.
- **Home:** install Docker Desktop.

Verify installation using a bash terminal:
```bash
docker --version
```

If your machine can't run Docker (no virtualization), use the Fallback Path below.

### Step 2c – VS Code + Extensions
- **Campus:** start VS Code from AppsAnywhere.
- **Home:** install Visual Studio Code.

With VS Code running, go to the Extensions tab:
- Install: **Dev Containers** extension by Microsoft.

### Step 2d – Configure the Dev Container
Using a Dev Container make your environment reproducible across different machines. Including a postCreateCommand auto-installs tools so you don't have to.

1. Open (or create) your folder for your project, e.g. HelloCloud, in VS Code. On campus this should be within the Source folder.
2. Open the Command Palette (Shift + Ctrl/Command + P) → **Dev Containers: Add Dev Container Configuration Files…** → Add configuration to workspace → Node.js & TypeScript. Accept remaining defaults.
3. Open `.devcontainer/devcontainer.json` and replace with:

```json
{
  "name": "Node.js & TypeScript",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm",
  "features": {
    "ghcr.io/devcontainers/features/azure-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-azurefunctions",
        "ms-azuretools.vscode-azureresourcegroups",
        "ms-azuretools.vscode-azuretools",
        "ms-vscode-remote.remote-containers"
      ]
    }
  },
  "postCreateCommand": "npm install -g azure-functions-core-tools@4 --unsafe-perm=true"
}
```

4. **Rebuild:** Command Palette → **Dev Containers: Rebuild and Reopen in Container**

Depending upon the specification of the machine, a dev container rebuild can take a few minutes. Even after the initial rebuild, the postCreateCommand could take another few minutes. Sometimes the first build timesout, but you'll be offered a button to retry.

**Alternative configuration** (if first build fails):
```json
{
  "name": "Node.js & TypeScript",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm",
  "runArgs": ["--platform=linux/amd64"],

  "features": {},

  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-azurefunctions",
        "ms-azuretools.vscode-azureresourcegroups",
        "ms-azuretools.vscode-azuretools",
        "ms-vscode-remote.remote-containers"
      ]
    }
  },

  "postCreateCommand": "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash && npm install -g azure-functions-core-tools@4 --unsafe-perm=true"
}
```

✅ **Checkpoint:** The VS Code terminal can run the following without error:
```bash
func --version
az --version
```

Always ensure you commit the `.devcontainer` folder to your Git repo so the environment follows you to different machines.

### Fallback Path (no Docker)
This is only an option on your home machine. Docker is recommended if you can use it. Otherwise...

1. Install Node.js LTS
2. Install VS Code + the Azure Functions extension.
3. Install the Azure CLI.
4. Install Azure Functions Core Tools:
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
func --version
```

✅ **Checkpoint:** Git, Node.js, VS Code, az and func all work on your host.

## Stage 3 Create and Run a New Azure Function
**Why:** We'll be using the serverless Azure Functions to write our web services. You need to build your first HTTP-triggered function and run it locally.

### Step 3a – Initialise a new Azure Function App project
In the VS Code terminal:
```bash
func init . --typescript
func new --name HelloHttp --template "HTTP trigger"
npm start
```

If you are ever unsure what a terminal command or line of code does, feel free to ask your preferred companion AI (or ask the tutor!).

You should be able to see a list of endpoints your Azure Function App is responding to in the terminal output. Try your app endpoint in a web browser...

**Without parameter:**
```
http://localhost:7071/api/HelloHttp
```

**With parameter:**
```
http://localhost:7071/api/HelloHttp?name=Alex
```

✅ **Checkpoint:** Output changes based on whether name is supplied.

💡 **Reflect:** What in the code seems to decide what message to return?

### Step 3b – Use AI to help understand the code
1. Open `src/functions/HelloHttp.ts` → right‑click → Explain with Copilot.
2. Ask: "Why is the name query parameter optional?" and "Which line handles it if missing?"

✅ **Checkpoint:** You can point to the exact lines handling optional input.

### Step 3c – Test with Postman
**Why:** using a web browser only allows you to test GET requests. You need something like Postman to test other HTTP verbs (e.g. POST or DELETE).

Open Postman. If you don't have it available, you could install the Postman extension in VS Code. You will need to register for a free account. Create a New HTTP Request...

1. Repeat the GET request with query parameter: `http://localhost:7071/api/HelloHttp?name=Alex`. Click Send.
2. Change the HTTP method to POST and remove the query parameter from the URL: `http://localhost:7071/api/HelloHttp`. In the Body tab, select raw → Text, and enter `Alex`. Click Send.

✅ **Checkpoint:** Both methods return the expected message.

💡 **Reflect:** Why would JSON be a better format for data being sent via POST?

### Step 3d – Stop your app running
In the VS Code terminal where your app is running, press `Ctrl + C`

✅ **Checkpoint:** The terminal input prompt appears enabling you to type in new commands.

## Stage 4 Deploy to Azure (CLI Workflow)
**Why:** You'll provision cloud resources explicitly so you control names, locations, and clean-up.

### Step 4a – Log in to your Azure account
```bash
az login
```

If this is the first time you've used your Azure subscription, you'll need to register some resource types to get it ready for our module:
```bash
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.Insights
az provider register --namespace Microsoft.PolicyInsights
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.DocumentDB
az provider register --namespace Microsoft.ManagedIdentity
az provider register --namespace Microsoft.EventGrid
az provider register --namespace Microsoft.KeyVault
```

You only need to do this once.

### Step 4b – Create a Resource Group
Make a container for all resources in the lab—deleting it later removes everything inside.

```bash
az group create \
  --name week1-lab-ab47-rg \
  --location uksouth
```

You should replace `ab47` with something unique to you. Azure naming rules can get tricky. In general, we'll use `project-env-uid-type` for naming our resources.

### Step 4c – Create a Storage Account
```bash
az storage account create \
  --name week1labab47store \
  --location uksouth \
  --resource-group week1-lab-ab47-rg \
  --sku Standard_LRS
```

Names must be globally unique, lowercase, 3–24 characters.

If you get an error message saying you cannot deploy resources to uksouth, you will need to use one of the regions you are allowed. Use this command and pick one to use in place of uksouth in all further examples:
```bash
az policy assignment list --query "[?name.contains(@, 'sys.regionrestriction')].parameters.listOfAllowedLocations.value | []" -o tsv
```

### Step 4d – Create the Function App
```bash
az functionapp create \
  --name week1-lab-ab47-func \
  --resource-group week1-lab-ab47-rg \
  --consumption-plan-location uksouth \
  --runtime node \
  --functions-version 4 \
  --storage-account week1labab47store
```

Function App name must also be globally unique. Remember to keep substituting `ab47` for your own chosen unique identifier.

### Step 4e – Publish your code
```bash
npm run build
func azure functionapp publish <your-function-app-name>
```

Be sure to substitute in the function name you used in step 4d. Don't include the angle brackets.

### Step 4f – Test the live endpoint
```
https://<your-function-app-name>.azurewebsites.net/api/HelloHttp?name=Alex
```

✅ **Checkpoint:** Your function responds over the internet.

💡 **Reflect:** What differences do you notice between local and cloud runs?

## Stage 5 Make a Screen Recording with OBS
**Why:** You'll practise creating a short demonstration clip like you'll need to do for your assessment.

1. Open OBS (AppsAnywhere on campus or install at home). Settings → Output → Recording Format = mp4. Set a sensible folder.
2. Add a Display/Window Capture so your editor, terminal, and Postman are visible. (Optional: add mic.)
3. **Start Recording.**
4. Edit `src/functions/HelloHttp.ts` to change the response (e.g., "Hello from Week 1 Lab!") and save.
5. Republish:
```bash
npm run build
func azure functionapp publish <your-function-app-name>
```
6. Test the live endpoint in Postman and show the updated message.
7. **Stop Recording** and locate the .mp4.

✅ **Checkpoint:** You have a 1–2 minute video showing edit → deploy → test.

💡 **Reflect:** Did your narration and on‑screen flow make sense?

## Stage 6 Explore Pricing
**Why:** Understanding serverless pricing shapes design decisions.

1. Go to Azure functions pricing.
2. Select UK South for the Region, Monthly, in GBP.

💡 **Reflect:** What does the free tier cover? What happens with 10,000 requests/day? How does PAYG compare to fixed pricing?

## Stage 7 (Optional) Provision and Deploy via the GUI
**Why:** Try the graphical flow and compare it to CLI.

1. In the portal: Create a resource → Function App. New Resource Group, unique names, Node.js, UK South, Consumption plan.
2. In VS Code → Azure panel → Resources → <subscription> → Function App → <new func name> → right-click → Deploy to Function App… → confirm.
3. Test the live URL in browser.

✅ **Checkpoint:** Code deployed via GUI.

💡 **Reflect:** Which did you prefer (CLI or GUI) and why? Which suits automation?

## Stage 8 (Optional) Coding Challenge
**Why:** Stretch your skills with input validation and multiple endpoints.

1. Enhance `HelloHttp` to accept JSON with `firstName` and `lastName`; respond "Hello, First Last!".
2. Add error handling: if fields are missing, return an informative message.
3. Create a second endpoint `TimeNowHttp` that returns the current server time.
4. Test both locally and in Azure; redeploy as needed.

✅ **Checkpoint:** Two endpoints run in Azure with basic validation.

💡 **Reflect:** How does validation improve reliability? Why multiple endpoints?

## Stage 9 Clean Up Resources
**Why:** Avoid unnecessary spend and practise good hygiene.

1. Identify resource groups you created:
   - e.g. `week1-lab-ab47-rg` (CLI workflow)
   - e.g. `week1-portal-ab47-rg` (if you tried the portal flow)

2. Delete via CLI:
```bash
az group delete \
  --name week1-lab-ab47-rg \
  --yes \
  --no-wait

az group delete \
  --name week1-portal-ab47-rg \
  --yes \
  --no-wait
```

3. Confirm in the portal under Resource groups.

✅ **Checkpoint:** All lab resources are deleted.

💡 **Reflect:** What risks come from leaving unused resources running?

## Wrap-Up Questions
- What differences did you notice between local and cloud execution?
- Why might serverless be cost‑effective for spiky workloads?
- How could pricing considerations influence your design?
- Which workflow do you prefer (CLI vs GUI)?
- How did the effort to deploy updated code compare to the effort to deploy the first time?
