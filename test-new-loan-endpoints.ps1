# Test New Loan Service Endpoints
# This script tests all the new endpoints added to the Loan Service

Write-Host "`n========== TESTING NEW LOAN SERVICE ENDPOINTS ==========`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:7072/api"
$createdLoanId = $null

# Test 1: Reserve a device (to have test data)
Write-Host "Test 1: Create a test reservation" -ForegroundColor Yellow
try {
    $reservation = @{
        userId = "test-student@university.edu"
        deviceId = "1"
        deviceModel = "Dell XPS 15"
    }
    $loan = Invoke-RestMethod -Uri "$baseUrl/loans/reserve" -Method POST -ContentType "application/json" -Body ($reservation | ConvertTo-Json)
    $createdLoanId = $loan.id
    Write-Host "✅ Created test loan: $createdLoanId" -ForegroundColor Green
    if (-not $createdLoanId) {
        Write-Host "   ⚠️  Warning: Loan ID is empty!" -ForegroundColor Yellow
        Write-Host "   Loan object: $($loan | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: List all loans
Write-Host "Test 2: List all loans" -ForegroundColor Yellow
try {
    $loans = Invoke-RestMethod -Uri "$baseUrl/loans" -Method GET
    Write-Host "✅ Found $($loans.Count) total loans" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Filter loans by user
Write-Host "Test 3: Filter loans by user ID" -ForegroundColor Yellow
try {
    $userLoans = Invoke-RestMethod -Uri "$baseUrl/loans?userId=test-student@university.edu" -Method GET
    Write-Host "✅ Found $($userLoans.Count) loans for test student" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Filter loans by device
Write-Host "Test 4: Filter loans by device ID" -ForegroundColor Yellow
try {
    $deviceLoans = Invoke-RestMethod -Uri "$baseUrl/loans?deviceId=1" -Method GET
    Write-Host "✅ Found $($deviceLoans.Count) loans for device #1" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Filter loans by status (reserved)
Write-Host "Test 5: Filter loans by status (reserved)" -ForegroundColor Yellow
try {
    $reservedLoans = Invoke-RestMethod -Uri "$baseUrl/loans?status=reserved" -Method GET
    Write-Host "✅ Found $($reservedLoans.Count) reserved loans" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Filter loans by status (collected)
Write-Host "Test 6: Filter loans by status (collected)" -ForegroundColor Yellow
try {
    $collectedLoans = Invoke-RestMethod -Uri "$baseUrl/loans?status=collected" -Method GET
    Write-Host "✅ Found $($collectedLoans.Count) collected loans" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Get overdue loans
Write-Host "Test 7: Get overdue loans" -ForegroundColor Yellow
try {
    $overdueLoans = Invoke-RestMethod -Uri "$baseUrl/overdue-loans" -Method GET
    Write-Host "✅ Found $($overdueLoans.Count) overdue loans" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Cancel a loan
Write-Host "Test 8: Cancel a reservation" -ForegroundColor Yellow
if ($createdLoanId) {
    try {
        $cancelRequest = @{
            userId = "test-student@university.edu"
        }
        $result = Invoke-RestMethod -Uri "$baseUrl/loans/$createdLoanId/cancel" -Method POST -ContentType "application/json" -Body ($cancelRequest | ConvertTo-Json)
        Write-Host "✅ Loan cancelled successfully" -ForegroundColor Green
        Write-Host "   Message: $($result.message)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped (no loan created)" -ForegroundColor Gray
}

Write-Host ""

# Test 9: Verify loan was cancelled
Write-Host "Test 9: Verify loan was cancelled" -ForegroundColor Yellow
if ($createdLoanId) {
    try {
        $loan = Invoke-RestMethod -Uri "$baseUrl/loans/$createdLoanId" -Method GET
        Write-Host "❌ Loan still exists (should have been deleted)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "✅ Loan not found (correctly deleted)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⏭️  Skipped (no loan created)" -ForegroundColor Gray
}

Write-Host ""

# Test 10: Combined filters (user + status)
Write-Host "Test 10: Combined filters (user + status)" -ForegroundColor Yellow
try {
    $filteredLoans = Invoke-RestMethod -Uri "$baseUrl/loans?userId=test-student@university.edu&status=reserved" -Method GET
    Write-Host "✅ Found $($filteredLoans.Count) reserved loans for test student" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========== TEST SUMMARY ==========`n" -ForegroundColor Cyan
Write-Host "All new Loan Service endpoints have been tested!" -ForegroundColor Green
Write-Host ""
Write-Host "New endpoints available:" -ForegroundColor White
Write-Host "  • GET    /api/loans?userId=X&deviceId=Y&status=Z  (Enhanced filtering)" -ForegroundColor Gray
Write-Host "  • GET    /api/overdue-loans                       (Get overdue loans)" -ForegroundColor Gray
Write-Host "  • POST   /api/loans/{id}/cancel                   (Cancel reservation)" -ForegroundColor Gray
Write-Host "  • DELETE /api/loans/{id}/cancel                   (Cancel reservation)" -ForegroundColor Gray
Write-Host ""
Write-Host "Existing endpoints:" -ForegroundColor White
Write-Host "  • POST   /api/loans/reserve                       (Reserve device)" -ForegroundColor Gray
Write-Host "  • POST   /api/loans/{id}/collect                  (Collect device)" -ForegroundColor Gray
Write-Host "  • POST   /api/loans/{id}/return                   (Return device)" -ForegroundColor Gray
Write-Host "  • GET    /api/loans                               (List all loans)" -ForegroundColor Gray
Write-Host "  • GET    /api/loans/{id}                          (Get single loan)" -ForegroundColor Gray
Write-Host ""
