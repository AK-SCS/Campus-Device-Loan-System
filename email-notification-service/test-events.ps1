# Email Notification Service Test Script
# Tests all three event types with sample data

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  EMAIL NOTIFICATION SERVICE TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:7073/api"

# Wait for service to be ready
Write-Host "Waiting for Email Service to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Test 1: Device Reserved Event
Write-Host "`n--- Test 1: Device Reserved Event ---`n" -ForegroundColor White

$reservedEvent = @{
    type = "device.reserved"
    data = @{
        loanId = "loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "MacBook Pro 16"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        reservedAt = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(2).ToUniversalTime().ToString("o")
    }
}

Write-Host "[RESERVED] Testing reservation confirmation email" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($reservedEvent | ConvertTo-Json -Depth 10) `
        -ErrorAction Stop
    
    Write-Host "  ✓ Success: $($response.message)" -ForegroundColor Green
    Write-Host "    Email Subject: $($response.emailSubject)" -ForegroundColor Gray
    Write-Host ""
    $test1 = $true
}
catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    $test1 = $false
}

# Test 2: Device Collected Event
Write-Host "`n--- Test 2: Device Collected Event ---`n" -ForegroundColor White

$collectedEvent = @{
    type = "device.collected"
    data = @{
        loanId = "loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "MacBook Pro 16"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        collectedAt = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(2).ToUniversalTime().ToString("o")
    }
}

Write-Host "[COLLECTED] Testing collection confirmation email" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($collectedEvent | ConvertTo-Json -Depth 10) `
        -ErrorAction Stop
    
    Write-Host "  ✓ Success: $($response.message)" -ForegroundColor Green
    Write-Host "    Email Subject: $($response.emailSubject)" -ForegroundColor Gray
    Write-Host ""
    $test2 = $true
}
catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    $test2 = $false
}

# Test 3: Device Returned Event
Write-Host "`n--- Test 3: Device Returned Event ---`n" -ForegroundColor White

$returnedEvent = @{
    type = "device.returned"
    data = @{
        loanId = "loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "MacBook Pro 16"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        returnedAt = (Get-Date).ToUniversalTime().ToString("o")
    }
}

Write-Host "[RETURNED] Testing return confirmation email" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($returnedEvent | ConvertTo-Json -Depth 10) `
        -ErrorAction Stop
    
    Write-Host "  ✓ Success: $($response.message)" -ForegroundColor Green
    Write-Host "    Email Subject: $($response.emailSubject)" -ForegroundColor Gray
    Write-Host ""
    $test3 = $true
}
catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    $test3 = $false
}

# Test 4: Invalid Event Type
Write-Host "`n--- Test 4: Invalid Event Type (should fail) ---`n" -ForegroundColor White

$invalidEvent = @{
    type = "device.invalid"
    data = @{
        loanId = "loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "MacBook Pro 16"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
    }
}

Write-Host "[INVALID] Testing invalid event type rejection" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($invalidEvent | ConvertTo-Json -Depth 10) `
        -ErrorAction Stop
    
    Write-Host "  ✗ Should have failed but succeeded" -ForegroundColor Red
    Write-Host ""
    $test4 = $false
}
catch {
    Write-Host "  ✓ Correctly rejected invalid event type" -ForegroundColor Green
    Write-Host ""
    $test4 = $true
}

# Test 5: Missing Required Field
Write-Host "`n--- Test 5: Missing Required Field (should fail) ---`n" -ForegroundColor White

$missingFieldEvent = @{
    type = "device.reserved"
    data = @{
        loanId = "loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "MacBook Pro 16"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        # Missing reservedAt and dueDate
    }
}

Write-Host "[MISSING_FIELD] Testing missing field rejection" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($missingFieldEvent | ConvertTo-Json -Depth 10) `
        -ErrorAction Stop
    
    Write-Host "  ✗ Should have failed but succeeded" -ForegroundColor Red
    Write-Host ""
    $test5 = $false
}
catch {
    Write-Host "  ✓ Correctly rejected missing fields" -ForegroundColor Green
    Write-Host ""
    $test5 = $true
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = 0
if ($test1) { $passCount++ }
if ($test2) { $passCount++ }
if ($test3) { $passCount++ }
if ($test4) { $passCount++ }
if ($test5) { $passCount++ }

Write-Host "Tests Passed: $passCount / 5" -ForegroundColor $(if ($passCount -eq 5) { "Green" } else { "Yellow" })
Write-Host ""

if ($passCount -eq 5) {
    Write-Host "✓ All tests passed! Email Service is working correctly." -ForegroundColor Green
    Write-Host "  Check the Email Service terminal to see the formatted email outputs.`n" -ForegroundColor Gray
} else {
    Write-Host "⚠ Some tests failed. Please review the errors above.`n" -ForegroundColor Yellow
}

Write-Host "Note: This test script only verifies the HTTP endpoint." -ForegroundColor Cyan
Write-Host "      In production, Event Grid will POST events to this endpoint automatically.`n" -ForegroundColor Cyan
