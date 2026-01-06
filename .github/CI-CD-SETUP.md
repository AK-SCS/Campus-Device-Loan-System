# CI/CD Setup Instructions

## Overview
This project uses GitHub Actions for automated builds and deployments to Azure.

## Prerequisites
- Azure subscription with existing resources deployed
- GitHub repository
- Azure CLI installed locally

## GitHub Secrets Configuration

### Required Secrets

1. **AZURE_CREDENTIALS** - Azure Service Principal credentials for deployment
2. **VITE_AUTH0_CLIENT_ID** - Auth0 client ID for frontend

### Optional Variables (Repository Variables)

These can be configured as Repository Variables for different environments:

- `VITE_DEVICE_CATALOGUE_API`
- `VITE_LOAN_SERVICE_API`
- `VITE_EMAIL_SERVICE_API`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_AUDIENCE`

## Step 1: Create Azure Service Principal

Run this command to create a service principal for GitHub Actions:

```bash
az ad sp create-for-rbac \
  --name "github-actions-campus-device-loan" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/campus-device-loan-rg \
  --sdk-auth
```

This will output JSON credentials like:

```json
{
  "clientId": "xxxx",
  "clientSecret": "xxxx",
  "subscriptionId": "xxxx",
  "tenantId": "xxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**Copy the entire JSON output - you'll need it for the next step.**

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Add AZURE_CREDENTIALS
- Name: `AZURE_CREDENTIALS`
- Value: Paste the entire JSON output from Step 1

### Add VITE_AUTH0_CLIENT_ID
- Name: `VITE_AUTH0_CLIENT_ID`
- Value: Your Auth0 Client ID (e.g., `FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M`)

## Step 3: Configure GitHub Environments (Optional)

For gated deployments to staging/production:

1. Go to **Settings** → **Environments**
2. Create environments: `test`, `staging`, `production`
3. For `staging` and `production`:
   - Enable **Required reviewers**
   - Add yourself as a reviewer
   - Enable **Wait timer** if desired (e.g., 5 minutes)

## Workflows Overview

### Build Workflows (Trigger: Push/PR)
- `build-device-catalogue.yml` - Builds device catalogue service
- `build-loan-service.yml` - Builds loan service
- `build-email-notification.yml` - Builds email notification service
- `build-frontend.yml` - Builds React frontend

### Deployment Workflows (Trigger: Push to main or Manual)

**Automatic Deployment (Push to main)**
- Automatically deploys to Test environment

**Manual Deployment (workflow_dispatch)**
- Can deploy to Test, Staging, or Production
- Staging and Production require manual approval (if configured)

## Testing the CI/CD Pipeline

### Method 1: Push to trigger automatic deployment
```bash
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

### Method 2: Manual workflow trigger
1. Go to **Actions** tab in GitHub
2. Select a deployment workflow (e.g., "Deploy - Device Catalogue Service")
3. Click **Run workflow**
4. Select environment (test/staging/production)
5. Click **Run workflow**

## Workflow Features

✅ **Build Stage**
- Node.js 20 environment
- Dependency caching for faster builds
- Automated artifact upload

✅ **Deploy Stage**
- Azure login with service principal
- Automated deployment to Azure Functions / Storage
- Environment-specific configurations
- Gated deployments with approvals

## Monitoring Deployments

### View Deployment Status
1. Go to **Actions** tab
2. Click on a workflow run
3. View detailed logs for each step

### View in Azure Portal
1. Visit https://portal.azure.com
2. Navigate to Resource Group: `campus-device-loan-rg`
3. Check Function App deployment center for latest deployment

## Troubleshooting

### Error: "Azure login failed"
- Verify `AZURE_CREDENTIALS` secret is correctly formatted JSON
- Check service principal has Contributor role
- Verify subscription ID matches your Azure subscription

### Error: "npm ci failed"
- Check package-lock.json is committed to repository
- Verify Node.js version (should be 20)

### Error: "Function app not found"
- Verify Function App names in workflow match Azure resources
- Check resource group name is correct

### Error: "Deployment failed"
- Check Azure Function App logs in Portal
- Verify Application Settings are configured
- Check Function App is not stopped

## Security Best Practices

✅ Use service principal with minimum required permissions
✅ Never commit secrets to repository
✅ Use GitHub Environments for production deployments
✅ Enable branch protection rules for main branch
✅ Require pull request reviews before merging
✅ Enable required status checks (build must pass)

## Next Steps

After CI/CD is working:
1. ✅ Add unit tests to build workflows
2. ✅ Add integration tests
3. ✅ Set up deployment slots for zero-downtime deployments
4. ✅ Configure alerts for failed deployments
5. ✅ Add performance testing to pipeline
