#!/bin/bash

# Azure Deployment Script for Campus Device Loan System - Catalogue Service
# Based on Cloud Native DevOps Week 1 Lab
# 
# IMPORTANT: Replace 'ab47' with your own unique identifier (e.g., your initials + numbers)
# throughout this script before running!

set -e  # Exit on any error

# Configuration - CUSTOMIZE THESE VALUES
UNIQUE_ID="cat2025"  # Unique identifier (shortened)
LOCATION="swedencentral"  # Using allowed region for your subscription
SERVICE_NAME="catalogue"
ENVIRONMENT="test"  # Can be: test, staging, prod

# Derived names following Azure naming conventions
RG_NAME="cdls-${SERVICE_NAME}-${ENVIRONMENT}-${UNIQUE_ID}-rg"
STORAGE_NAME="cdlscat${UNIQUE_ID}store"  # Shortened to fit 24 char limit
FUNC_NAME="cdls-${SERVICE_NAME}-${ENVIRONMENT}-${UNIQUE_ID}-func"

echo "=================================================="
echo "Azure Deployment Script"
echo "=================================================="
echo "Resource Group:  ${RG_NAME}"
echo "Storage Account: ${STORAGE_NAME}"
echo "Function App:    ${FUNC_NAME}"
echo "Location:        ${LOCATION}"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will create Azure resources that may incur costs!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Step 1: Login to Azure
echo ""
echo "Step 1: Logging in to Azure..."
az login

# Step 2: Register resource providers (first time only)
echo ""
echo "Step 2: Registering Azure resource providers..."
echo "(This is safe to run multiple times - it will skip if already registered)"
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.Insights

# Step 3: Create Resource Group
echo ""
echo "Step 3: Creating Resource Group: ${RG_NAME}..."
az group create \
  --name "${RG_NAME}" \
  --location "${LOCATION}"

# Step 4: Create Storage Account
echo ""
echo "Step 4: Creating Storage Account: ${STORAGE_NAME}..."
az storage account create \
  --name "${STORAGE_NAME}" \
  --location "${LOCATION}" \
  --resource-group "${RG_NAME}" \
  --sku Standard_LRS

# Step 5: Create Function App
echo ""
echo "Step 5: Creating Function App: ${FUNC_NAME}..."
az functionapp create \
  --name "${FUNC_NAME}" \
  --resource-group "${RG_NAME}" \
  --consumption-plan-location "${LOCATION}" \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --storage-account "${STORAGE_NAME}"

# Step 6: Configure Application Settings
echo ""
echo "Step 6: Configuring application settings..."
echo "Using FakeDeviceRepository for now (no Cosmos DB)"
az functionapp config appsettings set \
  --name "${FUNC_NAME}" \
  --resource-group "${RG_NAME}" \
  --settings \
    COSMOS_ENDPOINT="https://fake.documents.azure.com:443/" \
    COSMOS_KEY="fake-key" \
    COSMOS_DATABASE="fake-db" \
    COSMOS_CONTAINER="devices"

# Step 7: Build the application
echo ""
echo "Step 7: Building the application..."
cd cdls-catalogue-svc
npm install
npm run build

# Step 8: Deploy to Azure
echo ""
echo "Step 8: Deploying code to Azure..."
func azure functionapp publish "${FUNC_NAME}"

# Step 9: Get the Function URL
echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "Your Function App is now live at:"
echo "https://${FUNC_NAME}.azurewebsites.net"
echo ""
echo "Test your endpoints:"
echo "  Health:      https://${FUNC_NAME}.azurewebsites.net/api/Health"
echo "  Readiness:   https://${FUNC_NAME}.azurewebsites.net/api/Readiness"
echo "  Get Devices: https://${FUNC_NAME}.azurewebsites.net/api/GetDevices"
echo ""
echo "To test in browser or Postman, copy one of the URLs above."
echo ""
echo "=================================================="
echo "⚠️  REMEMBER: Clean up resources when done!"
echo "Run: ./cleanup-azure.sh"
echo "=================================================="
