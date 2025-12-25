#!/bin/bash

# Deploy Frontend to Azure Storage Static Website
# For Campus Device Loan System

set -e

# Configuration
UNIQUE_ID="cat2025"
LOCATION="swedencentral"
ENVIRONMENT="test"

# Derived names
RG_NAME="cdls-frontend-${ENVIRONMENT}-${UNIQUE_ID}-rg"
STORAGE_NAME="cdlsfe${UNIQUE_ID}"  # Must be lowercase, no hyphens

echo "=================================================="
echo "Frontend Deployment to Azure Storage"
echo "=================================================="
echo "Resource Group:  ${RG_NAME}"
echo "Storage Account: ${STORAGE_NAME}"
echo "Location:        ${LOCATION}"
echo "=================================================="
echo ""
echo "This will create Azure Storage and deploy the frontend."
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Step 1: Ensure logged in
echo ""
echo "Step 1: Ensuring Azure login..."
az account show &>/dev/null || az login

# Step 2: Create Resource Group
echo ""
echo "Step 2: Creating Resource Group: ${RG_NAME}..."
az group create \
  --name "${RG_NAME}" \
  --location "${LOCATION}"

# Step 3: Create Storage Account
echo ""
echo "Step 3: Creating Storage Account: ${STORAGE_NAME}..."
az storage account create \
  --name "${STORAGE_NAME}" \
  --resource-group "${RG_NAME}" \
  --location "${LOCATION}" \
  --sku Standard_LRS \
  --kind StorageV2

# Step 4: Enable Static Website Hosting
echo ""
echo "Step 4: Enabling static website hosting..."
az storage blob service-properties update \
  --account-name "${STORAGE_NAME}" \
  --static-website \
  --index-document index.html \
  --404-document index.html

# Step 5: Upload Frontend Files
echo ""
echo "Step 5: Uploading frontend files..."
az storage blob upload-batch \
  --account-name "${STORAGE_NAME}" \
  --source ./frontend \
  --destination '$web' \
  --overwrite

# Step 6: Get the website URL
echo ""
echo "Step 6: Retrieving website URL..."
WEBSITE_URL=$(az storage account show \
  --name "${STORAGE_NAME}" \
  --resource-group "${RG_NAME}" \
  --query "primaryEndpoints.web" \
  --output tsv)

echo ""
echo "=================================================="
echo "✅ Frontend Deployed Successfully!"
echo "=================================================="
echo ""
echo "Your website is live at:"
echo "${WEBSITE_URL}"
echo ""
echo "Next steps:"
echo "  1. Open the URL in your browser"
echo "  2. Enter your Function App API URL:"
echo "     https://cdls-catalogue-test-cat2025-func.azurewebsites.net/api/GetDevices"
echo "  3. Click 'Load Devices'"
echo ""
echo "Note: If CORS errors occur, run:"
echo "  ./configure-cors.sh"
echo ""
echo "=================================================="
