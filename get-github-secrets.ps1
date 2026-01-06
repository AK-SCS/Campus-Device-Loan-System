# Get GitHub Secrets for CI/CD
# This script retrieves publish profiles and prepares GitHub secrets

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  GitHub Secrets Setup" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Write-Host "📋 Retrieving publish profiles from Azure...`n" -ForegroundColor Yellow

# Device Catalogue Service
Write-Host "1️⃣  Device Catalogue Service" -ForegroundColor White
$deviceCatalogueProfile = az functionapp deployment list-publishing-profiles `
    --name campus-device-catalogue `
    --resource-group campus-device-loan-rg `
    --xml

# Loan Service
Write-Host "2️⃣  Loan Service" -ForegroundColor White
$loanServiceProfile = az functionapp deployment list-publishing-profiles `
    --name campus-loan-service `
    --resource-group campus-device-loan-rg `
    --xml

# Email Notification Service
Write-Host "3️⃣  Email Notification Service" -ForegroundColor White
$emailServiceProfile = az functionapp deployment list-publishing-profiles `
    --name campus-email-notification `
    --resource-group campus-device-loan-rg `
    --xml

# Storage Account Key for Frontend
Write-Host "4️⃣  Storage Account Key (Frontend)`n" -ForegroundColor White
$storageKey = az storage account keys list `
    --account-name campusdeviceapp `
    --resource-group campus-device-loan-rg `
    --query "[0].value" `
    --output tsv

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  GITHUB SECRETS TO ADD" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Write-Host "Go to: https://github.com/YOUR_USERNAME/Campus-Device-Loan-System/settings/secrets/actions`n" -ForegroundColor Yellow

Write-Host "Add these secrets (click 'New repository secret' for each):`n" -ForegroundColor White

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "Secret 1: AZURE_DEVICE_CATALOGUE_PUBLISH_PROFILE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host $deviceCatalogueProfile -ForegroundColor Gray
Write-Host "`n"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "Secret 2: AZURE_LOAN_SERVICE_PUBLISH_PROFILE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host $loanServiceProfile -ForegroundColor Gray
Write-Host "`n"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "Secret 3: AZURE_EMAIL_NOTIFICATION_PUBLISH_PROFILE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host $emailServiceProfile -ForegroundColor Gray
Write-Host "`n"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "Secret 4: AZURE_STORAGE_KEY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host $storageKey -ForegroundColor Gray
Write-Host "`n"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "Secret 5: VITE_AUTH0_CLIENT_ID" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M" -ForegroundColor Gray
Write-Host "`n"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

Write-Host "TIP: Copy each secret value above and paste into GitHub" -ForegroundColor Yellow
Write-Host "   (The values are already formatted for direct copy-paste)`n" -ForegroundColor Gray
