##############################################################################
# Test Script: Email Notification Service - All Event Types
# Tests all 5 email templates: reserved, collected, returned, cancelled, overdue
##############################################################################

$baseUrl = "http://localhost:7073/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "`n===== EMAIL NOTIFICATION SERVICE TESTS =====" -ForegroundColor Cyan
Write-Host "Testing all 5 email notification types`n" -ForegroundColor Cyan

##############################################################################
# Test 1: Reservation Confirmation Email
##############################################################################
Write-Host "[Test 1] Testing reservation confirmation email..." -ForegroundColor Yellow

$reservationEvent = @{
    type = "device.reserved"
    data = @{
        loanId = "test-loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "Dell XPS 15"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        reservedAt = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(2).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" -Method POST -Body $reservationEvent -Headers $headers
    Write-Host "  ✅ Reservation email processed" -ForegroundColor Green
    Write-Host "     Subject: $($response.emailSubject)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

##############################################################################
# Test 2: Collection Confirmation Email
##############################################################################
Write-Host "`n[Test 2] Testing collection confirmation email..." -ForegroundColor Yellow

$collectionEvent = @{
    type = "device.collected"
    data = @{
        loanId = "test-loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "Dell XPS 15"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        collectedAt = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(2).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" -Method POST -Body $collectionEvent -Headers $headers
    Write-Host "  ✅ Collection email processed" -ForegroundColor Green
    Write-Host "     Subject: $($response.emailSubject)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

##############################################################################
# Test 3: Return Confirmation Email
##############################################################################
Write-Host "`n[Test 3] Testing return confirmation email..." -ForegroundColor Yellow

$returnEvent = @{
    type = "device.returned"
    data = @{
        loanId = "test-loan-001"
        userId = "student123"
        deviceId = "device-001"
        deviceModel = "Dell XPS 15"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        returnedAt = (Get-Date).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" -Method POST -Body $returnEvent -Headers $headers
    Write-Host "  ✅ Return email processed" -ForegroundColor Green
    Write-Host "     Subject: $($response.emailSubject)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

##############################################################################
# Test 4: Cancellation Confirmation Email (NEW)
##############################################################################
Write-Host "`n[Test 4] Testing cancellation confirmation email..." -ForegroundColor Yellow

$cancellationEvent = @{
    type = "device.reservation.cancelled"
    data = @{
        loanId = "test-loan-002"
        userId = "student456"
        deviceId = "device-002"
        deviceModel = "MacBook Pro 16"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        cancelledAt = (Get-Date).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" -Method POST -Body $cancellationEvent -Headers $headers
    Write-Host "  ✅ Cancellation email processed" -ForegroundColor Green
    Write-Host "     Subject: $($response.emailSubject)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

##############################################################################
# Test 5: Overdue Reminder Email (NEW)
##############################################################################
Write-Host "`n[Test 5] Testing overdue reminder email..." -ForegroundColor Yellow

$overdueEvent = @{
    type = "loan.overdue"
    data = @{
        loanId = "test-loan-003"
        userId = "student789"
        deviceId = "device-003"
        deviceModel = "Surface Laptop 5"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(-3).ToUniversalTime().ToString("o")
        daysOverdue = 3
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" -Method POST -Body $overdueEvent -Headers $headers
    Write-Host "  ✅ Overdue reminder email processed" -ForegroundColor Green
    Write-Host "     Subject: $($response.emailSubject)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

##############################################################################
# Test 6: Invalid Event Type (Error Handling)
##############################################################################
Write-Host "`n[Test 6] Testing invalid event type (should fail gracefully)..." -ForegroundColor Yellow

$invalidEvent = @{
    type = "device.invalid"
    data = @{
        loanId = "test-loan-999"
        userId = "student999"
        deviceId = "device-999"
        deviceModel = "Test Device"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/handle-event" -Method POST -Body $invalidEvent -Headers $headers -ErrorAction Stop
    Write-Host "  ❌ Should have failed but didn't" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✅ Correctly rejected invalid event type (400 Bad Request)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Failed with unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

##############################################################################
# Summary
##############################################################################
Write-Host "`n===== TEST SUMMARY =====" -ForegroundColor Cyan
Write-Host "Email notification service supports:" -ForegroundColor White
Write-Host "  ✅ device.reserved - Reservation confirmation" -ForegroundColor Green
Write-Host "  ✅ device.collected - Collection confirmation" -ForegroundColor Green
Write-Host "  ✅ device.returned - Return confirmation" -ForegroundColor Green
Write-Host "  ✅ device.reservation.cancelled - Cancellation confirmation (NEW)" -ForegroundColor Green
Write-Host "  ✅ loan.overdue - Overdue reminder (NEW)" -ForegroundColor Green
Write-Host "`nCheck the Email Service terminal to see the email content logged.`n" -ForegroundColor Cyan

##############################################################################
# Endpoint Documentation
##############################################################################
Write-Host "===== EMAIL SERVICE ENDPOINT =====" -ForegroundColor Cyan
Write-Host "POST /api/handle-event" -ForegroundColor White
Write-Host "  - Receives loan events and sends appropriate emails" -ForegroundColor Gray
Write-Host "  - Supported event types:" -ForegroundColor Gray
Write-Host "    * device.reserved (requires: reservedAt, dueDate)" -ForegroundColor Gray
Write-Host "    * device.collected (requires: collectedAt, dueDate)" -ForegroundColor Gray
Write-Host "    * device.returned (requires: returnedAt)" -ForegroundColor Gray
Write-Host "    * device.reservation.cancelled (requires: cancelledAt)" -ForegroundColor Gray
Write-Host "    * loan.overdue (requires: dueDate, daysOverdue)" -ForegroundColor Gray
Write-Host ""
