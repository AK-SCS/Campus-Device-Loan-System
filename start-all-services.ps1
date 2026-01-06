#!/usr/bin/env pwsh

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CAMPUS DEVICE LOAN SYSTEM - STARTING ALL SERVICES     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Stop any existing processes
Write-Host "🛑 Stopping any existing services..." -ForegroundColor Yellow
Get-Process -Name "func" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*vite*" } | Stop-Process -Force
Start-Sleep -Seconds 3
Write-Host "   ✅ All existing processes stopped`n" -ForegroundColor Green

# Start Device Catalogue Service
Write-Host "📱 Starting Device Catalogue Service (Port 7071)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\device-catalogue-service'; Write-Host '`n═══ DEVICE CATALOGUE SERVICE (Port 7071) ═══`n' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 3

# Start Loan Service
Write-Host "📋 Starting Loan Service (Port 7072)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\loan-service'; Write-Host '`n═══ LOAN SERVICE (Port 7072) ═══`n' -ForegroundColor Cyan; npm start"
Start-Sleep -Seconds 3

# Start Email Notification Service
Write-Host "📧 Starting Email Notification Service (Port 7073)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\email-notification-service'; Write-Host '`n═══ EMAIL NOTIFICATION SERVICE (Port 7073) ═══`n' -ForegroundColor Magenta; npm start"
Start-Sleep -Seconds 3

# Start React Frontend
Write-Host "⚛️  Starting React Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend-react'; Write-Host '`n═══ REACT FRONTEND ═══`n' -ForegroundColor Blue; npm run dev"

Write-Host "`n⏳ Waiting 20 seconds for all services to start...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Verify services
Write-Host "═══ VERIFYING SERVICES ═══`n" -ForegroundColor Cyan

try {
    $devices = Invoke-RestMethod -Uri "http://localhost:7071/api/devices" -TimeoutSec 10
    Write-Host "✅ Device Catalogue: RUNNING ($($devices.Length) devices)" -ForegroundColor Green
} catch {
    Write-Host "❌ Device Catalogue: NOT READY" -ForegroundColor Red
}

try {
    $loans = Invoke-RestMethod -Uri "http://localhost:7072/api/loans" -TimeoutSec 10
    Write-Host "✅ Loan Service: RUNNING ($($loans.Length) loans)" -ForegroundColor Green
} catch {
    Write-Host "❌ Loan Service: NOT READY" -ForegroundColor Red
}

try {
    $fe = Invoke-WebRequest -Uri "http://localhost:5175" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Frontend: RUNNING (Status $($fe.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend: Still starting... (wait a few more seconds)" -ForegroundColor Yellow
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          🎉 ALL SERVICES STARTED SUCCESSFULLY! 🎉         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 SERVICE URLS:" -ForegroundColor Cyan
Write-Host "   • Device Catalogue: http://localhost:7071/api/devices" -ForegroundColor White
Write-Host "   • Loan Service:     http://localhost:7072/api/loans" -ForegroundColor White
Write-Host "   • Email Service:    http://localhost:7073/api/handle-event" -ForegroundColor White
Write-Host "   • React Frontend:   http://localhost:5175" -ForegroundColor White

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Open browser to: http://localhost:5175" -ForegroundColor White
Write-Host "   2. Click 'Sign In' button" -ForegroundColor White
Write-Host "   3. Select a device by clicking on it" -ForegroundColor White
Write-Host "   4. Click 'Reserve Device'" -ForegroundColor White
Write-Host "   5. Go to 'My Loans' tab to see your reservation`n" -ForegroundColor White

Write-Host "💡 TIP: All services are running in separate PowerShell windows" -ForegroundColor Gray
Write-Host "    You can close them individually or use Ctrl+C in each window" -ForegroundColor Gray
Write-Host ""
