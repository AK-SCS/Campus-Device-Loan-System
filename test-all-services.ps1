#!/usr/bin/env pwsh

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  COMPLETE SERVICE INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# Get Auth0 token for authenticated tests
Write-Host "Getting Auth0 test token..." -ForegroundColor Gray
$authToken = $null
try {
    # Try to get token - will fail if Password grant not enabled
    $auth0Domain = "campusdeviceloansystem.uk.auth0.com"
    $clientId = "FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M"
    $audience = "https://campusdeviceloansystem"
    
    $tokenBody = @{
        grant_type = "password"
        username = "student@test.com"
        password = "TestPassword123!"
        audience = $audience
        client_id = $clientId
        scope = "openid profile email"
    } | ConvertTo-Json
    
    $tokenResponse = Invoke-RestMethod `
        -Uri "https://$auth0Domain/oauth/token" `
        -Method POST `
        -Body $tokenBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $authToken = $tokenResponse.access_token
    Write-Host "  Token acquired successfully!" -ForegroundColor Green
} catch {
    Write-Host "  Note: Could not get Auth0 token automatically" -ForegroundColor Yellow
    Write-Host "  Tests 4-6 will be skipped (require authentication)" -ForegroundColor Yellow
    Write-Host "  To enable: See AUTH0-COMPLETE-SETUP.md for setup instructions`n" -ForegroundColor Gray
}

# Test 1: Device Catalogue - List Devices
Write-Host "`n[TEST 1/7] Device Catalogue - List all devices" -ForegroundColor Yellow
try {
    $devices = Invoke-RestMethod -Uri "http://localhost:7071/api/devices" -Method GET -TimeoutSec 5
    Write-Host "  PASS - Found $($devices.Count) devices" -ForegroundColor Green
    $devices | Select-Object -First 3 | Format-Table id, brand, model, category, availableCount
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Device Catalogue - Get Specific Device
Write-Host "`n[TEST 2/7] Device Catalogue - Get device by ID" -ForegroundColor Yellow
try {
    $device = Invoke-RestMethod -Uri "http://localhost:7071/api/devices/1" -Method GET -TimeoutSec 5
    Write-Host "  PASS - $($device.brand) $($device.model)" -ForegroundColor Green
    Write-Host "    Available: $($device.availableCount)/$($device.totalCount)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Loan Service - List Loans
Write-Host "`n[TEST 3/7] Loan Service - List all loans" -ForegroundColor Yellow
try {
    $loans = Invoke-RestMethod -Uri "http://localhost:7072/api/loans" -Method GET -TimeoutSec 5
    Write-Host "  PASS - Found $($loans.Count) loans" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Loan Service - Reserve a Device
Write-Host "`n[TEST 4/7] Loan Service - Reserve device" -ForegroundColor Yellow
if ($authToken) {
    try {
        $reservationBody = @{
            deviceId = "1"
            userId = "student@test.com"
            userName = "Test Student"
            userEmail = "student@test.com"
            plannedCollectionDate = (Get-Date).AddDays(1).ToString("o")
        } | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "Bearer $authToken"
            "Content-Type" = "application/json"
        }
        
        $reservation = Invoke-RestMethod `
            -Uri "http://localhost:7072/api/loans/reserve" `
            -Method POST `
            -Headers $headers `
            -Body $reservationBody `
            -TimeoutSec 10
        
        Write-Host "  PASS - Reserved device. Loan ID: $($reservation.loanId)" -ForegroundColor Green
        $global:testLoanId = $reservation.loanId
        $testsPassed++
    } catch {
        Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  SKIPPED - No Auth0 token available" -ForegroundColor Yellow
    Write-Host "  Fix: Follow AUTH0-COMPLETE-SETUP.md to enable Password grant" -ForegroundColor Gray
    $testsFailed++
}

# Test 5-6: Collection and Return
Write-Host "`n[TEST 5/7] Loan Service - Collect device" -ForegroundColor Yellow
if ($authToken -and $global:testLoanId) {
    try {
        $headers = @{
            "Authorization" = "Bearer $authToken"
        }
        
        $collectResult = Invoke-RestMethod `
            -Uri "http://localhost:7072/api/loans/$($global:testLoanId)/collect" `
            -Method POST `
            -Headers $headers `
            -TimeoutSec 10
        
        Write-Host "  PASS - Device collected successfully" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  SKIPPED - Depends on successful reservation" -ForegroundColor Yellow
    $testsFailed++
}

Write-Host "`n[TEST 6/7] Loan Service - Return device" -ForegroundColor Yellow
if ($authToken -and $global:testLoanId) {
    try {
        $headers = @{
            "Authorization" = "Bearer $authToken"
        }
        
        $returnResult = Invoke-RestMethod `
            -Uri "http://localhost:7072/api/loans/$($global:testLoanId)/return" `
            -Method POST `
            -Headers $headers `
            -TimeoutSec 10
        
        Write-Host "  PASS - Device returned successfully" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  SKIPPED - Depends on successful collection" -ForegroundColor Yellow
    $testsFailed++
}

# Test 7: Email Service - Handle Event
Write-Host "`n[TEST 7/7] Email Service - Handle reservation event" -ForegroundColor Yellow
try {
    # Create Event Grid event format (not just raw event data)
    $eventGridEvent = @(
        @{
            id = [Guid]::NewGuid().ToString()
            eventType = "Loan.Reserved"
            subject = "devices/1"
            eventTime = (Get-Date).ToUniversalTime().ToString("o")
            data = @{
                loanId = "test-loan-001"
                deviceId = "1"
                deviceModel = "Dell XPS 15"
                userId = "student@example.com"
                userName = "Test Student"
                userEmail = "student@example.com"
                reservedAt = (Get-Date).ToString("o")
                dueDate = (Get-Date).AddDays(2).ToString("o")
            }
            dataVersion = "1.0"
        }
    ) | ConvertTo-Json -Depth 4
    
    Write-Host "  Sending Event Grid formatted event..." -ForegroundColor Gray
    $emailResult = Invoke-RestMethod `
        -Uri "http://localhost:7073/api/handle-event" `
        -Method POST `
        -Body $eventGridEvent `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    Write-Host "  PASS - Email event processed: $emailResult" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Gray
    }
    Write-Host "  NOTE: Check if Email Service is running on port 7073" -ForegroundColor Yellow
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tests Passed: $testsPassed/7" -ForegroundColor $(if ($testsPassed -ge 6) { "Green" } elseif ($testsPassed -ge 3) { "Yellow" } else { "Red" })
Write-Host "  Tests Failed: $testsFailed/7" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } elseif ($testsFailed -le 2) { "Yellow" } else { "Red" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($testsPassed -eq 7) {
    Write-Host "`nALL TESTS PASSED! System fully functional!" -ForegroundColor Green
    Write-Host "Frontend ready at: http://localhost:5176`n" -ForegroundColor Cyan
} elseif ($testsPassed -ge 3 -and -not $authToken) {
    Write-Host "`nCore services working! Auth0 tests skipped." -ForegroundColor Yellow
    Write-Host "`nTo enable Auth0 tests:" -ForegroundColor Cyan
    Write-Host "1. Read AUTH0-COMPLETE-SETUP.md for setup instructions" -ForegroundColor Gray
    Write-Host "2. Enable Password grant in Auth0 dashboard" -ForegroundColor Gray
    Write-Host "3. Re-run this test script" -ForegroundColor Gray
    Write-Host "`nManual testing available at: http://localhost:5176`n" -ForegroundColor Cyan
} elseif ($testsPassed -ge 3) {
    Write-Host "`nSome tests failed. Review errors above." -ForegroundColor Yellow
    Write-Host "Test full flow manually at: http://localhost:5176`n" -ForegroundColor Cyan
} else {
    Write-Host "`nServices not running. Start them with:" -ForegroundColor Red
    Write-Host "  Terminal 1: cd device-catalogue-service; npm start" -ForegroundColor Yellow
    Write-Host "  Terminal 2: cd loan-service; npm start" -ForegroundColor Yellow
    Write-Host "  Terminal 3: cd email-notification-service; npm start" -ForegroundColor Yellow
    Write-Host "  Terminal 4: cd frontend-react; npm run dev" -ForegroundColor Yellow
    Write-Host ""
}
