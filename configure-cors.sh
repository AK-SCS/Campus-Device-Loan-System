#!/bin/bash

# Configure CORS on Azure Function App
# Allows the frontend to call the backend API from a different domain

set -e

# Configuration
UNIQUE_ID="cat2025"
ENVIRONMENT="test"
SERVICE_NAME="catalogue"

# Derived names
RG_NAME="cdls-${SERVICE_NAME}-${ENVIRONMENT}-${UNIQUE_ID}-rg"
FUNC_NAME="cdls-${SERVICE_NAME}-${ENVIRONMENT}-${UNIQUE_ID}-func"
FRONTEND_RG="cdls-frontend-${ENVIRONMENT}-${UNIQUE_ID}-rg"
FRONTEND_STORAGE="cdlsfe${UNIQUE_ID}"

echo "=================================================="
echo "Configuring CORS for Function App"
echo "=================================================="
echo "Function App: ${FUNC_NAME}"
echo "=================================================="

# Step 1: Get frontend URL if it exists
echo ""
echo "Step 1: Checking for deployed frontend..."
FRONTEND_URL=""
if az storage account show --name "${FRONTEND_STORAGE}" --resource-group "${FRONTEND_RG}" &>/dev/null; then
    FRONTEND_URL=$(az storage account show \
      --name "${FRONTEND_STORAGE}" \
      --resource-group "${FRONTEND_RG}" \
      --query "primaryEndpoints.web" \
      --output tsv | sed 's:/*$::')  # Remove trailing slash
    echo "Found frontend at: ${FRONTEND_URL}"
else
    echo "Frontend not deployed yet. Will allow common origins."
fi

# Step 2: Configure CORS
echo ""
echo "Step 2: Configuring CORS..."

# Build allowed origins list
ALLOWED_ORIGINS="http://localhost:5500 http://localhost:8080 http://127.0.0.1:5500 http://127.0.0.1:8080"

if [ -n "$FRONTEND_URL" ]; then
    ALLOWED_ORIGINS="${ALLOWED_ORIGINS} ${FRONTEND_URL}"
fi

echo "Allowed origins:"
echo "${ALLOWED_ORIGINS}"

az functionapp cors remove \
  --name "${FUNC_NAME}" \
  --resource-group "${RG_NAME}" \
  --allowed-origins || true

az functionapp cors add \
  --name "${FUNC_NAME}" \
  --resource-group "${RG_NAME}" \
  --allowed-origins ${ALLOWED_ORIGINS}

echo ""
echo "=================================================="
echo "✅ CORS Configured Successfully!"
echo "=================================================="
echo ""
echo "Your Function App now accepts requests from:"
for origin in ${ALLOWED_ORIGINS}; do
    echo "  - ${origin}"
done
echo ""
echo "Test the API from the frontend or use curl:"
echo "  curl https://${FUNC_NAME}.azurewebsites.net/api/GetDevices"
echo ""
echo "=================================================="
