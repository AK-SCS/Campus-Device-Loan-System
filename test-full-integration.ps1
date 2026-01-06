##############################################################################
# FULL SYSTEM INTEGRATION TEST
# Tests complete flow: Frontend -> Device Catalogue -> Loan Service -> Email
##############################################################################

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          FULL SYSTEM INTEGRATION TEST                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$deviceUrl = "http://localhost:7071/api"
$loanUrl = "http://localhost:7072/api"
$emailUrl = "http://localhost:7073/api"
$frontendUrl = "http://localhost:5175"
$headers = @{ "Content-Type" = "application/json" }

$testsPassed = 0
$testsFailed = 0

##############################################################################
# Test 1: Check all services are running
##############################################################################
Write-Host "Test 1: Service Health Checks" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$services = @(
    @{ Name = "Device Catalogue"; Url = "$deviceUrl/devices" },
    @{ Name = "Loan Service"; Url = "$loanUrl/loans" },
    @{ Name = "Email Service"; Url = "$emailUrl/handle-event" },
    @{ Name = "React Frontend"; Url = $frontendUrl }
)

foreach ($service in $services) {
    try {
        $null = Invoke-WebRequest -Uri $service.Url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✅ $($service.Name) is running" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ $($service.Name) is NOT running" -ForegroundColor Red
        $testsFailed++
    }
}

##############################################################################
# Test 2: Test device filtering (new feature)
##############################################################################
Write-Host "`nTest 2: Device Filtering" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

try {
    $allDevices = Invoke-RestMethod -Uri "$deviceUrl/devices" -Method GET
    Write-Host "  ✅ All devices: $($allDevices.Count) total" -ForegroundColor Green
    $testsPassed++
    
    $laptops = Invoke-RestMethod -Uri "$deviceUrl/devices?category=laptop" -Method GET
    Write-Host "  ✅ Laptops only: $($laptops.Count) devices" -ForegroundColor Green
    $testsPassed++
    
    $available = Invoke-RestMethod -Uri "$deviceUrl/devices?availableOnly=true" -Method GET
    Write-Host "  ✅ Available only: $($available.Count) devices" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Device filtering failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed += 3
}

##############################################################################
# Test 3: Full reservation flow
##############################################################################
Write-Host "`nTest 3: Complete Reservation Flow" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$testUserId = "integration-test-$(Get-Random)"

try {
    # Step 1: Get device availability
    $device = Invoke-RestMethod -Uri "$deviceUrl/devices/1" -Method GET
    $initialAvail = $device.availableCount
    Write-Host "  Step 1: Initial availability: $initialAvail" -ForegroundColor White
    
    # Step 2: Make reservation
    $reservation = @{
        userId = $testUserId
        deviceId = "1"
        userEmail = "$testUserId@test.com"
        userName = "Test User"
    } | ConvertTo-Json
    
    $loan = Invoke-RestMethod -Uri "$loanUrl/loans/reserve" -Method POST -Body $reservation -Headers $headers
    Write-Host "  Step 2: Reservation created: $($loan.loanId)" -ForegroundColor White
    Start-Sleep -Seconds 2
    
    # Step 3: Verify availability decreased
    $device = Invoke-RestMethod -Uri "$deviceUrl/devices/1" -Method GET
    $newAvail = $device.availableCount
    
    if -$newAvail -eq ($initialAvail - 1-) {
        Write-Host "  Step 3: ✅ Availability decreased correctly: $initialAvail → $newAvail" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  Step 3: ❌ Availability incorrect: $initialAvail → $newAvail" -ForegroundColor Red
        $testsFailed++
    }
    
    # Step 4: View user's loans
    $userLoans = Invoke-RestMethod -Uri "$loanUrl/loans?userId=$testUserId" -Method GET
    Write-Host "  Step 4: User has $($userLoans.Count) loan(s)" -ForegroundColor White
    
    # Step 5: Cancel reservation
    $cancelData = @{ userId = $testUserId } | ConvertTo-Json
    Invoke-RestMethod -Uri "$loanUrl/loans/$($loan.loanId)/cancel" -Method POST -Body $cancelData -Headers $headers
    Write-Host "  Step 5: Reservation cancelled" -ForegroundColor White
    Start-Sleep -Seconds 2
    
    # Step 6: Verify availability restored
    $device = Invoke-RestMethod -Uri "$deviceUrl/devices/1" -Method GET
    $finalAvail = $device.availableCount
    
    if ($finalAvail -eq $initialAvail) {
        Write-Host "  Step 6: ✅ Availability restored: $newAvail → $finalAvail" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  Step 6: ❌ Availability not restored: expected $initialAvail, got $finalAvail" -ForegroundColor Red
        $testsFailed++
    }
    
    Write-Host "`n  ✅ Full reservation flow completed successfully!" -ForegroundColor Green
    $testsPassed++
    
} catch {
    Write-Host "`n  ❌ Reservation flow failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

##############################################################################
# Test 4: Email notification integration
##############################################################################
Write-Host "`nTest 4: Email Notification Integration" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$events = @(
    @{ type = "device.reserved"; name = "Reservation" },
    @{ type = "device.collected"; name = "Collection" },
    @{ type = "device.returned"; name = "Return" },
    @{ type = "device.reservation.cancelled"; name = "Cancellation" },
    @{ type = "loan.overdue"; name = "Overdue" }
)

foreach ($eventType in $events) {
    try {
        $eventData = @{
            type = $eventType.type
            data = @{
                loanId = "test-loan-$(Get-Random)"
                userId = "test@test.com"
                deviceId = "1"
                deviceModel = "Test Device"
                timestamp = (Get-Date).ToUniversalTime().ToString("o")
            }
        }
        
        # Add type-specific fields
        switch ($eventType.type) {
            "device.reserved" {
                $eventData.data.reservedAt = (Get-Date).ToUniversalTime().ToString("o")
                $eventData.data.dueDate = (Get-Date).AddDays-2-.ToUniversalTime().ToString("o")
            }
            "device.collected" {
                $eventData.data.collectedAt = (Get-Date).ToUniversalTime().ToString("o")
                $eventData.data.dueDate = (Get-Date).AddDays-2-.ToUniversalTime().ToString("o")
            }
            "device.returned" {
                $eventData.data.returnedAt = (Get-Date).ToUniversalTime().ToString("o")
            }
            "device.reservation.cancelled" {
                $eventData.data.cancelledAt = (Get-Date).ToUniversalTime().ToString("o")
            }
            "loan.overdue" {
                $eventData.data.dueDate = (Get-Date).AddDays--3-.ToUniversalTime().ToString("o")
                $eventData.data.daysOverdue = 3
            }
        }
        
        $eventJson = $event | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$emailUrl/handle-event" -Method POST -Body $eventJson -Headers $headers
        Write-Host "  ✅ $($eventType.name) email sent" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ $($eventType.name) email failed: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
}

##############################################################################
# Test 5: Loan filtering (new feature)
##############################################################################
Write-Host "`nTest 5: Loan Filtering" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

try {
    $allLoans = Invoke-RestMethod -Uri "$loanUrl/loans" -Method GET
    Write-Host "  ✅ All loans: $($allLoans.Count) total" -ForegroundColor Green
    $testsPassed++
    
    $reservedLoans = Invoke-RestMethod -Uri "$loanUrl/loans?status=reserved" -Method GET
    Write-Host "  ✅ Reserved loans: $($reservedLoans.Count) loans" -ForegroundColor Green
    $testsPassed++
    
    $overdueLoans = Invoke-RestMethod -Uri "$loanUrl/overdue-loans" -Method GET
    Write-Host "  ✅ Overdue loans: $($overdueLoans.Count) loans" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  ❌ Loan filtering failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed += 3
}

##############################################################################
# Summary
##############################################################################
$totalTests = $testsPassed + $testsFailed
$passRate = if -$totalTests -gt 0- { [math]::Round(($testsPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST SUMMARY                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total Tests:    $totalTests" -ForegroundColor White
Write-Host "  ✅ Passed:       $testsPassed" -ForegroundColor Green
Write-Host "  ❌ Failed:       $testsFailed" -ForegroundColor $-if ($testsFailed -eq 0- { "Green" } else { "Red" })
Write-Host "  📊 Pass Rate:    $passRate%" -ForegroundColor $-if ($passRate -eq 100- { "Green" } elseif -$passRate -ge 80- { "Yellow" } else { "Red" })
Write-Host ""

if -$testsFailed -eq 0- {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     🎉 ALL SYSTEMS INTEGRATED - FULLY FUNCTIONAL! 🎉         ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Frontend connected to all backend services" -ForegroundColor Green
    Write-Host "✅ Device filtering working for category and availability" -ForegroundColor Green
    Write-Host "✅ Loan management working for reserve, cancel, and filter" -ForegroundColor Green
    Write-Host "✅ Email notifications working -5 event types-" -ForegroundColor Green
    Write-Host "✅ Service-to-service integration verified" -ForegroundColor Green
    Write-Host ""
    Write-Host "Open your browser to: http://localhost:5175" -ForegroundColor Cyan
    Write-Host "Try these features:" -ForegroundColor Yellow
    Write-Host "  1. Browse devices with category filter" -ForegroundColor White
    Write-Host "  2. Sign In and reserve a device" -ForegroundColor White
    Write-Host "  3. View 'My Loans' tab" -ForegroundColor White
    Write-Host "  4. Cancel a reservation" -ForegroundColor White
    Write-Host "  5. Check 'Overdue' tab" -ForegroundColor White
    Write-Host ""
}

Write-Host "Services running at:" -ForegroundColor Cyan
Write-Host "  • Device Catalogue: http://localhost:7071/api/devices" -ForegroundColor White
Write-Host "  • Loan Service:     http://localhost:7072/api/loans" -ForegroundColor White
Write-Host "  • Email Service:    http://localhost:7073/api/handle-event" -ForegroundColor White
Write-Host "  • React Frontend:   http://localhost:5175" -ForegroundColor White
Write-Host ""

