# Azure Cosmos DB Azure Functions CORS Azure Storage Account
# Week 5 Lab Worksheet
**Topic: Deploying a Web Service and Web App to Azure (dev & test environments)**

## Learning Outcomes
By the end of this lab you should be able to:

- Provision and configure separate dev and test environments in Azure.
- Configure an Azure Functions App to read settings from environment variables and local.settings.json.
- Deploy the app to Azure and verify it uses the correct Cosmos DB instance.
- Configure CORS for local development and for a cloud-hosted web app.
- Host a static SPA in Azure Storage and connect it to your cloud web service.

## Stage 1 Quick Quiz
**Why?** To refresh key ideas before you start deploying.

Complete the short consolidation quiz (in this week's folder on Blackboard). This checks your understanding of:

- How environments and resource groups define and separate deployed systems in Azure.
- How environment variables control configuration across different environments.
- How Single Page Apps are hosted in Azure and why they can't hold secrets.
- How CORS enables your SPA to communicate safely with cloud APIs on other domains.

💡 **Reflection:** Note one concept you feel confident about and one you want to clarify as you go.

## Stage 2 Run the Service Locally (dev)
**Why?** You need a working local baseline before introducing environment variables and deployment.

❗ **Warning:** remember to substitute in your own unique id in all Azure resource names for this worksheet.

1. Fork the service repo: `tpdavison/cis3039-reviews-api`.
2. Clone your fork locally in VS Code. Be sure to Reopen with the Dev Container.
3. Restore the npm packages: `npm install` in the VS Code terminal.
4. Provision Cosmos DB (follow the instructions in the repo README). Use `dev` as the environment tag in names (e.g., `reviews-dev-ab47-cosmos`).
5. Modify the config within `src/config/appServices.ts` to point the service at your dev Cosmos DB.
6. Set the Cosmos key as a local environment variable (instructions in the README).
7. `npm run seed` to run the seed script to populate sample items.
8. `npm start` to run the service locally and test the GET via browser. If asked, we are using the node runtime.

✅ **Checkpoint:** The Azure Function App runs locally and reads/writes to your dev Cosmos DB.

## Stage 3 Use Environment Variables
**Why?** Hard-coded settings tie your code to one environment. Environment variables enable dev/test separation.

1. Rework the `COSMOS_OPTIONS` in `src/config/appServices.ts` so endpoint, database, and container are read from environment variables in a similar way as key currently is.
2. Run locally — it should fail (no Cosmos config provided yet).
3. Add those variables in the Values section of `local.settings.json`. The base URL will need to be similar to `https://<account-name>.documents.azure.com:443/`
4. Run again — confirm the service connects successfully.

ℹ︎ **Tip:** Keep secret values (like primary keys) out of source control.

✅ **Checkpoint:** Service uses env vars and runs locally (connecting to Azure db) using values from `local.settings.json`.

## Stage 4 Deploy a Test Environment (Azure)
**Why?** The cloud test environment validates your deployment pipeline and separation from dev data.

1. Create a resource group for test (use `test` tag in names).
2. Create a new Cosmos DB in this RG (repeat dev steps, but with test naming).
3. Provision an Azure Function App in the same RG and region (Consumption plan):

```bash
az storage account create \
  --name reviewstestab47funcstore \
  --location uksouth \
  --resource-group reviews-test-ab47-rg \
  --sku Standard_LRS

az functionapp create \
  --name reviews-test-ab47-func \
  --resource-group reviews-test-ab47-rg \
  --storage-account reviewstestab47funcstore \
  --consumption-plan-location uksouth \
  --runtime node \
  --functions-version 4
```

4. Configure the Azure Function App env vars (e.g. Cosmos endpoint, database, container, key):

```bash
az functionapp config appsettings set \
  --name reviews-test-ab47-func \
  --resource-group reviews-test-ab47-rg \
  --settings COSMOS_KEY=$TEST_COSMOS_KEY COSMOS_ENDPOINT="https://reviews-test-ab47-cosmos.documents.azure.com:443/"
```

5. Publish your project to the Function App via VS Code or CLI:

```bash
npm run build

func azure functionapp publish reviews-test-ab47-func
```

6. Confirm it runs: hit the cloud endpoint in Postman or a browser.
7. Verify separation: Use Data Explorer in the Azure Portal to edit data in the test Cosmos DB and confirm the live API reflects only test data.

❗ **Warning:** Double-check you're not accidentally pointing the cloud app at your dev DB.

✅ **Checkpoint:** Cloud-based Azure Function App responds and uses test Cosmos DB.

## Stage 5 Connect the Web App Locally (CORS)
**Why?** Your SPA must call the cloud API across origins, which requires correct CORS configuration.

1. Fork the web app repo: `tpdavison/cis3039-reviews-app`.
2. Clone locally, open in Dev Container and then run (`npm run dev`). It uses a built-in fake and shows no data.
3. Enable test seed fake by editing `.env` as guided by the file comments. Confirm fake data appears.
4. Inspect `appSettings` to see how configuration is read from environment variables.
5. Point to your deployed API: set the API base URL in `.env` to that of your test Function App.
6. Run again — expect a CORS error in the browser console.
7. Allow localhost in Function App CORS (adjust port if different):

```bash
az functionapp cors add \
  --name reviews-test-ab47-func \
  --resource-group reviews-test-ab47-rg \
  --allowed-origins http://localhost:5173
```

✅ **Checkpoint:** SPA now loads real data from your test API when run locally.

## Stage 6 Host the Web App in Azure Storage
**Why?** Hosting your SPA in Azure completes the end-to-end cloud deployment.

1. Create a Storage Account suited for static sites:

```bash
az storage account create \
  --name reviewstestab47store \
  --resource-group reviews-test-ab47-rg \
  --location uksouth \
  --sku Standard_LRS \
  --kind StorageV2
```

2. Enable static website and set the index page:

```bash
az storage blob service-properties update \
  --account-name reviewstestab47store \
  --static-website \
  --index-document index.html \
  --404-document index.html
```

3. Build the SPA and upload the contents of `dist` to the `$web` container:

```bash
npm run build

az storage blob upload-batch \
  --account-name reviewstestab47store \
  --source ./dist \
  --destination '$web' \
  --overwrite

az storage account show \
  --name reviewstestab47store \
  --resource-group reviews-test-ab47-rg \
  --query "primaryEndpoints.web" \
  --output tsv
```

4. Add your storage site to CORS on the Function App (so the deployed web app can access the web service):

```bash
az functionapp cors add \
  --name reviews-test-ab47-func \
  --resource-group reviews-test-ab47-rg \
  --allowed-origins https://reviewstestab47store.z33.web.core.windows.net
```

✅ **Checkpoint:** Visiting your storage endpoint shows the SPA using your cloud test API and data.

## Stage 7 Apply today's techniques to your own assessment work.
- Use environment variables in your service code (appSettings) so configuration is easily managed.
- Provision separate dev and test environments in Azure. Use dev for your code when it is running locally. Use test as a purely deployed environment.
- Deploy your services to Azure Function Apps; configure their env vars.
- Host your web apps in Azure Storage and connect it to your deployed web service; update CORS on your web services.
