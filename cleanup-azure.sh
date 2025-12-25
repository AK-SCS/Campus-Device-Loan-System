#!/bin/bash

# Azure Resource Cleanup Script
# Deletes all resources created by deploy-to-azure.sh

set -e

# Configuration - MUST MATCH what you used in deploy-to-azure.sh
UNIQUE_ID="cdls2025"  # Must match your deployment
LOCATION="swedencentral"
SERVICE_NAME="catalogue"
ENVIRONMENT="test"

# Derived names
RG_NAME="cdls-${SERVICE_NAME}-${ENVIRONMENT}-${UNIQUE_ID}-rg"

echo "=================================================="
echo "Azure Resource Cleanup"
echo "=================================================="
echo "This will DELETE the following resource group"
echo "and ALL resources inside it:"
echo ""
echo "  ${RG_NAME}"
echo ""
echo "⚠️  WARNING: This action CANNOT be undone!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo ""
echo "Deleting resource group: ${RG_NAME}..."
az group delete \
  --name "${RG_NAME}" \
  --yes \
  --no-wait

echo ""
echo "✅ Deletion initiated!"
echo "Resources are being deleted in the background."
echo "This may take a few minutes to complete."
echo ""
echo "To check status:"
echo "  az group show --name ${RG_NAME}"
echo ""
