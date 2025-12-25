#!/bin/bash

# Setup Development Environment for Campus Device Loan System
# Creates a separate Cosmos DB instance for development (separate from test/production)

set -e

# Configuration
UNIQUE_ID="cat2025"
LOCATION="swedencentral"
SERVICE_NAME="catalogue"
ENVIRONMENT="dev"  # Development environment

# Derived names
RG_NAME="cdls-${SERVICE_NAME}-${ENVIRONMENT}-${UNIQUE_ID}-rg"
COSMOS_ACCOUNT="cdls-${SERVICE_NAME}-${ENVIRONMENT}-${UNIQUE_ID}"
COSMOS_DB="cdls-db"
COSMOS_CONTAINER="devices"

echo "=================================================="
echo "Setting Up Development Environment"
echo "=================================================="
echo "Resource Group:   ${RG_NAME}"
echo "Cosmos Account:   ${COSMOS_ACCOUNT}"
echo "Database:         ${COSMOS_DB}"
echo "Container:        ${COSMOS_CONTAINER}"
echo "Location:         ${LOCATION}"
echo "=================================================="
echo ""
echo "This will create Azure resources for DEVELOPMENT."
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Step 1: Login to Azure (if not already logged in)
echo ""
echo "Step 1: Ensuring Azure login..."
az account show &>/dev/null || az login

# Step 2: Create Resource Group
echo ""
echo "Step 2: Creating Resource Group: ${RG_NAME}..."
az group create \
  --name "${RG_NAME}" \
  --location "${LOCATION}"

# Step 3: Create Cosmos DB Account
echo ""
echo "Step 3: Creating Cosmos DB Account: ${COSMOS_ACCOUNT}..."
echo "(This may take 3-5 minutes...)"
az cosmosdb create \
  --name "${COSMOS_ACCOUNT}" \
  --resource-group "${RG_NAME}" \
  --locations regionName="${LOCATION}" \
  --default-consistency-level Session

# Step 4: Create Database
echo ""
echo "Step 4: Creating Database: ${COSMOS_DB}..."
az cosmosdb sql database create \
  --account-name "${COSMOS_ACCOUNT}" \
  --resource-group "${RG_NAME}" \
  --name "${COSMOS_DB}"

# Step 5: Create Container
echo ""
echo "Step 5: Creating Container: ${COSMOS_CONTAINER}..."
az cosmosdb sql container create \
  --account-name "${COSMOS_ACCOUNT}" \
  --resource-group "${RG_NAME}" \
  --database-name "${COSMOS_DB}" \
  --name "${COSMOS_CONTAINER}" \
  --partition-key-path "/id" \
  --throughput 400

# Step 6: Get connection details
echo ""
echo "Step 6: Retrieving connection details..."
COSMOS_ENDPOINT=$(az cosmosdb show \
  --name "${COSMOS_ACCOUNT}" \
  --resource-group "${RG_NAME}" \
  --query documentEndpoint \
  --output tsv)

COSMOS_KEY=$(az cosmosdb keys list \
  --name "${COSMOS_ACCOUNT}" \
  --resource-group "${RG_NAME}" \
  --query primaryMasterKey \
  --output tsv)

# Step 7: Update local.settings.json
echo ""
echo "Step 7: Updating local.settings.json..."
cat > cdls-catalogue-svc/local.settings.json <<EOF
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",

    "COSMOS_ENDPOINT": "${COSMOS_ENDPOINT}",
    "COSMOS_KEY": "${COSMOS_KEY}",
    "COSMOS_DATABASE": "${COSMOS_DB}",
    "COSMOS_CONTAINER": "${COSMOS_CONTAINER}"
  }
}
EOF

echo ""
echo "=================================================="
echo "✅ Development Environment Created!"
echo "=================================================="
echo ""
echo "Cosmos DB Details:"
echo "  Endpoint: ${COSMOS_ENDPOINT}"
echo "  Database: ${COSMOS_DB}"
echo "  Container: ${COSMOS_CONTAINER}"
echo ""
echo "Next steps:"
echo "  1. Seed the development database:"
echo "     cd cdls-catalogue-svc && npm run seed"
echo ""
echo "  2. Test locally:"
echo "     npm start"
echo ""
echo "=================================================="
