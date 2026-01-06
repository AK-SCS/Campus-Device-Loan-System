# GitHub Actions Azure Setup Script
# This script creates the Azure Service Principal and displays the credentials needed for GitHub Actions

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  GitHub Actions Azure Setup" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Get subscription ID
Write-Host "📋 Getting Azure subscription information..." -ForegroundColor Yellow
$subscriptionId = (az account show --query id -o tsv)
$subscriptionName = (az account show --query name -o tsv)

Write-Host "✅ Subscription: $subscriptionName" -ForegroundColor Green
Write-Host "   ID: $subscriptionId`n" -ForegroundColor Gray

# Check if service principal already exists
Write-Host "🔍 Checking for existing service principal..." -ForegroundColor Yellow
$spName = "github-actions-campus-device-loan"
$existingSp = az ad sp list --display-name $spName --query "[0].appId" -o tsv

if ($existingSp) {
    Write-Host "⚠️  Service principal '$spName' already exists!" -ForegroundColor Yellow
    Write-Host "   App ID: $existingSp`n" -ForegroundColor Gray
    
    $response = Read-Host "Do you want to reset credentials? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "`n❌ Aborted. Use existing service principal or delete it first." -ForegroundColor Red
        exit
    }
}

# Create service principal
Write-Host "`n🔐 Creating Azure Service Principal for GitHub Actions..." -ForegroundColor Yellow
Write-Host "   Name: $spName" -ForegroundColor Gray
Write-Host "   Scope: /subscriptions/$subscriptionId/resourceGroups/campus-device-loan-rg" -ForegroundColor Gray
Write-Host "   Role: Contributor`n" -ForegroundColor Gray

$credentials = az ad sp create-for-rbac `
    --name $spName `
    --role contributor `
    --scopes "/subscriptions/$subscriptionId/resourceGroups/campus-device-loan-rg" `
    --sdk-auth

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to create service principal!" -ForegroundColor Red
    Write-Host "   Please check your Azure permissions and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Service Principal created successfully!`n" -ForegroundColor Green

# Display credentials
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  GITHUB SECRET: AZURE_CREDENTIALS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nCopy the JSON below and add it as a GitHub secret:" -ForegroundColor Yellow
Write-Host "`n┌────────────────────────────────────────┐" -ForegroundColor DarkGray
Write-Host $credentials -ForegroundColor White
Write-Host "└────────────────────────────────────────┘`n" -ForegroundColor DarkGray

# Display instructions
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`n1️⃣  Go to your GitHub repository" -ForegroundColor White
Write-Host "   URL: https://github.com/YOUR_USERNAME/Campus-Device-Loan-System`n" -ForegroundColor Gray

Write-Host "2️⃣  Navigate to Settings → Secrets and variables → Actions`n" -ForegroundColor White

Write-Host "3️⃣  Click 'New repository secret'" -ForegroundColor White
Write-Host "   Name: AZURE_CREDENTIALS" -ForegroundColor Gray
Write-Host "   Value: [Paste the JSON above]`n" -ForegroundColor Gray

Write-Host "4️⃣  Add Auth0 secret:" -ForegroundColor White
Write-Host "   Name: VITE_AUTH0_CLIENT_ID" -ForegroundColor Gray
Write-Host "   Value: FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M`n" -ForegroundColor Gray

Write-Host "5️⃣  Test the workflow:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m `"ci: add GitHub Actions workflows`"" -ForegroundColor Gray
Write-Host "   git push origin main`n" -ForegroundColor Gray

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ADDITIONAL INFORMATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nService Principal Details:" -ForegroundColor White
Write-Host "  Display Name: $spName" -ForegroundColor Gray
Write-Host "  Scope: Resource Group 'campus-device-loan-rg'" -ForegroundColor Gray
Write-Host "  Permissions: Contributor (can deploy and manage resources)`n" -ForegroundColor Gray

Write-Host "To delete this service principal later:" -ForegroundColor White
Write-Host "  az ad sp delete --id $spName`n" -ForegroundColor Gray

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================================`n" -ForegroundColor Cyan
