# Loan Service Endpoint Testing Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  LOAN SERVICE AUTOMATED TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:7072/api"
$testsPassed = 0
$testsFailed = 0

# Wait for service to be ready
Start-Sleep -Seconds 2

# Test 1: Reserve a device
Write-Host "[Test 1] Reserve Device - POST /loans/reserve" -ForegroundColor Yellow
try {
    $body = @{
        userId = "student1"
        deviceId = "1"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/loans/reserve" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "  ✅ PASSED" -ForegroundColor Green
    Write-Host "     Loan ID: $($response.loanId)"
    Write-Host "     Device: $($response.deviceModel)"
    Write-Host "     Due Date: $($response.dueDate)"
    $loanId = $response.loanId
    $testsPassed++
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 2: List all loans
Write-Host "[Test 2] List All Loans - GET /loans" -ForegroundColor Yellow
try {
    $loans = Invoke-RestMethod -Uri "$baseUrl/loans" -Method GET
    
    Write-Host "  ✅ PASSED" -ForegroundColor Green
    Write-Host "     Total loans: $($loans.Count)"
    if ($loans.Count -gt 0) {
        Write-Host "     First loan ID: $($loans[0].id)"
        Write-Host "     Status: $($loans[0].status)"
    }
    $testsPassed++
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 3: Get specific loan
if ($loanId) {
    Write-Host "[Test 3] Get Loan by ID - GET /loans/$loanId" -ForegroundColor Yellow
    try {
        $loan = Invoke-RestMethod -Uri "$baseUrl/loans/$loanId" -Method GET
        
        Write-Host "  ✅ PASSED" -ForegroundColor Green
        Write-Host "     Loan ID: $($loan.id)"
        Write-Host "     User ID: $($loan.userId)"
        Write-Host "     Device: $($loan.deviceModel)"
        Write-Host "     Status: $($loan.status)"
        $testsPassed++
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    Write-Host ""
}

# Test 4: Collect device
if ($loanId) {
    Write-Host "[Test 4] Collect Device - POST /loans/$loanId/collect" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/loans/$loanId/collect" -Method POST
        
        Write-Host "  ✅ PASSED" -ForegroundColor Green
        Write-Host "     Message: $($response.message)"
        $testsPassed++
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    Write-Host ""
}

# Test 5: Try to collect again (should fail)
if ($loanId) {
    Write-Host "[Test 5] Collect Device Again (Should Fail) - POST /loans/$loanId/collect" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/loans/$loanId/collect" -Method POST -ErrorAction Stop
        Write-Host "  ❌ FAILED: Should have returned an error but succeeded" -ForegroundColor Red
        $testsFailed++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "  ✅ PASSED - Correctly rejected (400 Bad Request)" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "  ❌ FAILED: Wrong error code - $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            $testsFailed++
        }
    }
    Write-Host ""
}

# Test 6: Return device
if ($loanId) {
    Write-Host "[Test 6] Return Device - POST /loans/$loanId/return" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/loans/$loanId/return" -Method POST
        
        Write-Host "  ✅ PASSED" -ForegroundColor Green
        Write-Host "     Message: $($response.message)"
        $testsPassed++
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    Write-Host ""
}

# Test 7: Try to reserve same device again (concurrency test)
Write-Host "[Test 7] Reserve Second Device (Different ID) - POST /loans/reserve" -ForegroundColor Yellow
try {
    $body = @{
        userId = "student2"
        deviceId = "2"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/loans/reserve" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "  ✅ PASSED" -ForegroundColor Green
    Write-Host "     Loan ID: $($response.loanId)"
    Write-Host "     Device: $($response.deviceModel)"
    $testsPassed++
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 8: Test concurrency protection
Write-Host "[Test 8] Concurrency Test - Reserve Already Reserved Device" -ForegroundColor Yellow
try {
    $body = @{
        userId = "student3"
        deviceId = "2"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/loans/reserve" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ❌ FAILED: Should have been rejected (device already reserved)" -ForegroundColor Red
    $testsFailed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✅ PASSED - Correctly rejected concurrent reservation (400 Bad Request)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ❌ FAILED: Wrong error code - $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Red
    exit 1
}
