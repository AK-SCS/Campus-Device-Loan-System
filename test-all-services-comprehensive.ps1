##############################################################################
# COMPREHENSIVE SERVICE TEST SUITE
# Tests all three backend services and their integration
##############################################################################

$ErrorActionPreference = "Continue"
$testsPassed = 0
$testsFailed = 0
$testsSkipped = 0

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CAMPUS DEVICE LOAN SYSTEM - FULL INTEGRATION TEST        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

##############################################################################
# SECTION 1: SERVICE HEALTH CHECKS
##############################################################################
Write-Host "═══ SECTION 1: Service Health Checks ═══`n" -ForegroundColor Yellow

$services = @(
    @{ Name = "Device Catalogue"; Port = 7071; Url = "http://localhost:7071/api/devices" },
    @{ Name = "Loan Service"; Port = 7072; Url = "http://localhost:7072/api/loans" },
    @{ Name = "Email Service"; Port = 7073; Url = "http://localhost:7073/api/handle-event" }
)

foreach ($service in $services) {
    Write-Host "[Health Check] Testing $($service.Name) (Port $($service.Port))..." -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri $service.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  ✅ $($service.Name) is responding (Status: $($response.StatusCode))" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ $($service.Name) is NOT responding: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ""

##############################################################################
# SECTION 2: DEVICE CATALOGUE SERVICE TESTS
##############################################################################
Write-Host "═══ SECTION 2: Device Catalogue Service - 9 tests ═══`n" -ForegroundColor Yellow

$deviceUrl = "http://localhost:7071/api"
$headers = @{ "Content-Type" = "application/json" }

# Test 2.1: List all devices
Write-Host "Test 2.1: List all devices..." -ForegroundColor White
try {
    $devices = Invoke-RestMethod -Uri "$deviceUrl/devices" -Method GET
    Write-Host "  ✅ Found $($devices.Count) devices" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2.2: Get single device
Write-Host "Test 2.2] Get single device by ID..." -ForegroundColor White
try {
    $device = Invoke-RestMethod -Uri "$deviceUrl/devices/1" -Method GET
    Write-Host "  ✅ Retrieved device: $($device.model)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2.3: Filter by category
Write-Host "Test 2.3] Filter devices by category (laptop)..." -ForegroundColor White
try {
    $laptops = Invoke-RestMethod -Uri "$deviceUrl/devices?category=laptop" -Method GET
    Write-Host "  ✅ Found $($laptops.Count) laptops" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2.4: Filter available only
Write-Host "Test 2.4] Filter available devices only..." -ForegroundColor White
try {
    $available = Invoke-RestMethod -Uri "$deviceUrl/devices?availableOnly=true" -Method GET
    Write-Host "  ✅ Found $($available.Count) available devices" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2.5: Add new device
Write-Host "Test 2.5] Add new test device..." -ForegroundColor White
$newDevice = @{
    id = "test-device-$(Get-Random)"
    model = "Test Laptop Pro"
    category = "laptop"
    specifications = "Test specs"
    availableQuantity = 5
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod -Uri "$deviceUrl/devices" -Method POST -Body $newDevice -Headers $headers
    $global:testDeviceId = $created.id
    Write-Host "  ✅ Created device: $($created.id)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2.6: Update device
if ($global:testDeviceId) {
    Write-Host "Test 2.6] Update device..." -ForegroundColor White
    $updateDevice = @{
        id = $global:testDeviceId
        model = "Test Laptop Pro Updated"
        category = "laptop"
        specifications = "Updated specs"
        availableQuantity = 3
    } | ConvertTo-Json
    
    try {
        $null = Invoke-RestMethod -Uri "$deviceUrl/devices/$($global:testDeviceId)" -Method PUT -Body $updateDevice -Headers $headers
        Write-Host "  ✅ Updated device successfully" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "Test 2.6] Update device... ⏭️  Skipped (no device created)" -ForegroundColor Yellow
    $testsSkipped++
}

# Test 2.7: Update availability
if ($global:testDeviceId) {
    Write-Host "Test 2.7] Update device availability..." -ForegroundColor White
    $availUpdate = @{ change = -1 } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$deviceUrl/devices/$($global:testDeviceId)/availability" -Method PATCH -Body $availUpdate -Headers $headers
        Write-Host "  ✅ Availability updated" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "Test 2.7] Update availability... ⏭️  Skipped" -ForegroundColor Yellow
    $testsSkipped++
}

# Test 2.8: Delete device
if ($global:testDeviceId) {
    Write-Host "Test 2.8] Delete test device..." -ForegroundColor White
    try {
        Invoke-RestMethod -Uri "$deviceUrl/devices/$($global:testDeviceId)" -Method DELETE
        Write-Host "  ✅ Device deleted successfully" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "Test 2.8] Delete device... ⏭️  Skipped" -ForegroundColor Yellow
    $testsSkipped++
}

Write-Host ""

##############################################################################
# SECTION 3: LOAN SERVICE TESTS
##############################################################################
Write-Host "═══ SECTION 3: Loan Service - 8 tests ═══`n" -ForegroundColor Yellow

$loanUrl = "http://localhost:7072/api"

# Test 3.1: Reserve device (integration with Device Catalogue)
Write-Host "Test 3.1] Reserve device (INTEGRATION TEST)..." -ForegroundColor White
$reservation = @{
    userId = "test-student-$(Get-Random)"
    deviceId = "1"
    userEmail = "test@example.com"
    userName = "Test Student"
} | ConvertTo-Json

try {
    $loan = Invoke-RestMethod -Uri "$loanUrl/loans/reserve" -Method POST -Body $reservation -Headers $headers
    $global:testLoanId = $loan.id
    Write-Host "  ✅ Reservation created: $($loan.id)" -ForegroundColor Green
    Write-Host "     Due: $($loan.dueDate)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3.2: List all loans
Write-Host "Test 3.2] List all loans..." -ForegroundColor White
try {
    $loans = Invoke-RestMethod -Uri "$loanUrl/loans" -Method GET
    Write-Host "  ✅ Found $($loans.Count) loans" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3.3: Filter by status
Write-Host "Test 3.3] Filter loans by status (reserved)..." -ForegroundColor White
try {
    $reserved = Invoke-RestMethod -Uri "$loanUrl/loans?status=reserved" -Method GET
    Write-Host "  ✅ Found $($reserved.Count) reserved loans" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3.4: Filter by deviceId
Write-Host "Test 3.4] Filter loans by deviceId..." -ForegroundColor White
try {
    $deviceLoans = Invoke-RestMethod -Uri "$loanUrl/loans?deviceId=1" -Method GET
    Write-Host "  ✅ Found $($deviceLoans.Count) loans for device #1" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3.5: Get overdue loans
Write-Host "Test 3.5] Get overdue loans..." -ForegroundColor White
try {
    $overdue = Invoke-RestMethod -Uri "$loanUrl/overdue-loans" -Method GET
    Write-Host "  ✅ Found $($overdue.Count) overdue loans" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3.6: Get single loan
if ($global:testLoanId) {
    Write-Host "Test 3.6] Get single loan by ID..." -ForegroundColor White
    try {
        $loan = Invoke-RestMethod -Uri "$loanUrl/loans/$($global:testLoanId)" -Method GET
        Write-Host "  ✅ Retrieved loan: $($loan.id) (Status: $($loan.status))" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "Test 3.6] Get single loan... ⏭️  Skipped" -ForegroundColor Yellow
    $testsSkipped++
}

# Test 3.7: Cancel loan (integration - restores availability)
if ($global:testLoanId) {
    Write-Host "Test 3.7] Cancel reservation (INTEGRATION TEST)..." -ForegroundColor White
    $cancelData = @{ userId = $reservation.userId } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$loanUrl/loans/$($global:testLoanId)/cancel" -Method POST -Body $cancelData -Headers $headers
        Write-Host "  ✅ Reservation cancelled (device returned to inventory)" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "Test 3.7] Cancel reservation... ⏭️  Skipped" -ForegroundColor Yellow
    $testsSkipped++
}

# Test 3.8: Verify cancellation
if ($global:testLoanId) {
    Write-Host "Test 3.8] Verify loan was deleted..." -ForegroundColor White
    try {
        Invoke-RestMethod -Uri "$loanUrl/loans/$($global:testLoanId)" -Method GET -ErrorAction Stop
        Write-Host "  ❌ Loan still exists (should be deleted)" -ForegroundColor Red
        $testsFailed++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "  ✅ Loan correctly deleted (404 Not Found)" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "  ❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
            $testsFailed++
        }
    }
} else {
    Write-Host "Test 3.8] Verify cancellation... ⏭️  Skipped" -ForegroundColor Yellow
    $testsSkipped++
}

Write-Host ""

##############################################################################
# SECTION 4: EMAIL NOTIFICATION SERVICE TESTS
##############################################################################
Write-Host "═══ SECTION 4: Email Notification Service - 6 tests ═══`n" -ForegroundColor Yellow

$emailUrl = "http://localhost:7073/api"

# Test 4.1: Reservation email
Write-Host "Test 4.1] Send reservation confirmation email..." -ForegroundColor White
$reservationEvent = @{
    type = "device.reserved"
    data = @{
        loanId = "test-loan-001"
        userId = "student123"
        deviceId = "1"
        deviceModel = "Dell XPS 15"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        reservedAt = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(2).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$emailUrl/handle-event" -Method POST -Body $reservationEvent -Headers $headers
    Write-Host "  ✅ Email sent: $($response.emailSubject)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4.2: Collection email
Write-Host "Test 4.2] Send collection confirmation email..." -ForegroundColor White
$collectionEvent = @{
    type = "device.collected"
    data = @{
        loanId = "test-loan-001"
        userId = "student123"
        deviceId = "1"
        deviceModel = "Dell XPS 15"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        collectedAt = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(2).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$emailUrl/handle-event" -Method POST -Body $collectionEvent -Headers $headers
    Write-Host "  ✅ Email sent: $($response.emailSubject)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4.3: Return email
Write-Host "Test 4.3] Send return confirmation email..." -ForegroundColor White
$returnEvent = @{
    type = "device.returned"
    data = @{
        loanId = "test-loan-001"
        userId = "student123"
        deviceId = "1"
        deviceModel = "Dell XPS 15"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        returnedAt = (Get-Date).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$emailUrl/handle-event" -Method POST -Body $returnEvent -Headers $headers
    Write-Host "  ✅ Email sent: $($response.emailSubject)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4.4: Cancellation email
Write-Host "Test 4.4] Send cancellation confirmation email..." -ForegroundColor White
$cancellationEvent = @{
    type = "device.reservation.cancelled"
    data = @{
        loanId = "test-loan-002"
        userId = "student456"
        deviceId = "2"
        deviceModel = "MacBook Pro 16"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        cancelledAt = (Get-Date).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$emailUrl/handle-event" -Method POST -Body $cancellationEvent -Headers $headers
    Write-Host "  ✅ Email sent: $($response.emailSubject)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4.5: Overdue email
Write-Host "Test 4.5] Send overdue reminder email..." -ForegroundColor White
$overdueEvent = @{
    type = "loan.overdue"
    data = @{
        loanId = "test-loan-003"
        userId = "student789"
        deviceId = "3"
        deviceModel = "Surface Laptop 5"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        dueDate = (Get-Date).AddDays(-3).ToUniversalTime().ToString("o")
        daysOverdue = 3
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$emailUrl/handle-event" -Method POST -Body $overdueEvent -Headers $headers
    Write-Host "  ✅ Email sent: $($response.emailSubject)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4.6: Invalid event type
Write-Host "Test 4.6] Test error handling (invalid event)..." -ForegroundColor White
$invalidEvent = @{
    type = "device.invalid"
    data = @{
        loanId = "test"
        userId = "test"
        deviceId = "test"
        deviceModel = "test"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    Invoke-RestMethod -Uri "$emailUrl/handle-event" -Method POST -Body $invalidEvent -Headers $headers -ErrorAction Stop
    Write-Host "  ❌ Should have rejected invalid event" -ForegroundColor Red
    $testsFailed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✅ Correctly rejected (400 Bad Request)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ❌ Unexpected error" -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ""

##############################################################################
# SECTION 5: SERVICE INTEGRATION TEST
##############################################################################
Write-Host "═══ SECTION 5: End-to-End Integration Test ═══`n" -ForegroundColor Yellow

Write-Host "[Integration] Full reservation flow..." -ForegroundColor White
Write-Host "  Step 1: Check device availability..." -ForegroundColor Gray

try {
    $device = Invoke-RestMethod -Uri "$deviceUrl/devices/1" -Method GET
    $initialAvailability = $device.availableQuantity
    Write-Host "    Initial availability: $initialAvailability" -ForegroundColor Gray
    
    Write-Host "  Step 2: Reserve device..." -ForegroundColor Gray
    $reservation = @{
        userId = "integration-test-$(Get-Random)"
        deviceId = "1"
        userEmail = "integration@test.com"
        userName = "Integration Test"
    } | ConvertTo-Json
    
    $loan = Invoke-RestMethod -Uri "$loanUrl/loans/reserve" -Method POST -Body $reservation -Headers $headers
    $integrationLoanId = $loan.id
    
    Write-Host "  Step 3: Verify availability decreased..." -ForegroundColor Gray
    Start-Sleep -Seconds 1
    $device = Invoke-RestMethod -Uri "$deviceUrl/devices/1" -Method GET
    $newAvailability = $device.availableQuantity
    
    if ($newAvailability -eq ($initialAvailability - 1)) {
        Write-Host "    Availability correctly decreased: $initialAvailability → $newAvailability" -ForegroundColor Gray
        
        Write-Host "  Step 4: Cancel reservation..." -ForegroundColor Gray
        $cancelData = @{ userId = $reservation.userId } | ConvertTo-Json
        Invoke-RestMethod -Uri "$loanUrl/loans/$integrationLoanId/cancel" -Method POST -Body $cancelData -Headers $headers
        
        Write-Host "  Step 5: Verify availability restored..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
        $device = Invoke-RestMethod -Uri "$deviceUrl/devices/1" -Method GET
        $finalAvailability = $device.availableQuantity
        
        if ($finalAvailability -eq $initialAvailability) {
            Write-Host "    Availability correctly restored: $newAvailability → $finalAvailability" -ForegroundColor Gray
            Write-Host "  ✅ FULL INTEGRATION TEST PASSED" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "  ❌ Availability not restored correctly" -ForegroundColor Red
            $testsFailed++
        }
    } else {
        Write-Host "  ❌ Availability did not decrease correctly" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ❌ Integration test failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

##############################################################################
# FINAL SUMMARY
##############################################################################
$totalTests = $testsPassed + $testsFailed + $testsSkipped
$passRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST SUMMARY                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total Tests:    $totalTests" -ForegroundColor White
Write-Host "  ✅ Passed:       $testsPassed" -ForegroundColor Green
Write-Host "  ❌ Failed:       $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⏭️  Skipped:      $testsSkipped" -ForegroundColor Yellow
Write-Host "  📊 Pass Rate:    $passRate%" -ForegroundColor $(if ($passRate -eq 100) { "Green" } elseif ($passRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          🎉 ALL TESTS PASSED - SYSTEM READY! 🎉              ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "All three services are fully operational with no errors:" -ForegroundColor Green
    Write-Host "  ✅ Device Catalogue Service - 8 endpoints" -ForegroundColor Green
    Write-Host "  ✅ Loan Service - 8 endpoints" -ForegroundColor Green
    Write-Host "  ✅ Email Notification Service (5 event types + timer)" -ForegroundColor Green
    Write-Host "  ✅ Service-to-service integration working" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║           ⚠️  SOME TESTS FAILED - REVIEW ERRORS              ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Services running at:" -ForegroundColor Cyan
Write-Host "  • Device Catalogue: http://localhost:7071/api/devices" -ForegroundColor White
Write-Host "  • Loan Service:     http://localhost:7072/api/loans" -ForegroundColor White
Write-Host "  • Email Service:    http://localhost:7073/api/handle-event" -ForegroundColor White
Write-Host "  • React Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host ""
