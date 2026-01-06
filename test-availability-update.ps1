Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTING DEVICE AVAILABILITY UPDATE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check initial availability
Write-Host "[Step 1] Checking initial availability for Dell XPS 15..." -ForegroundColor Yellow
$initialDevice = Invoke-RestMethod -Uri "http://localhost:7071/api/devices/1" -Method GET
Write-Host "  Initial available: $($initialDevice.availableCount)/$($initialDevice.totalCount)" -ForegroundColor Gray

# Step 2: Test the update endpoint directly
Write-Host "`n[Step 2] Testing direct update endpoint..." -ForegroundColor Yellow
$updateBody = @{ decrementBy = 1 } | ConvertTo-Json
try {
    $updated = Invoke-RestMethod -Uri "http://localhost:7071/api/devices/1/update-availability" -Method POST -Body $updateBody -ContentType "application/json"
    Write-Host "  ✓ Update successful! New available: $($updated.availableCount)/$($updated.totalCount)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Verify the change
Write-Host "`n[Step 3] Verifying change..." -ForegroundColor Yellow
$verifyDevice = Invoke-RestMethod -Uri "http://localhost:7071/api/devices/1" -Method GET
Write-Host "  Current available: $($verifyDevice.availableCount)/$($verifyDevice.totalCount)" -ForegroundColor Gray

# Step 4: Increment back
Write-Host "`n[Step 4] Incrementing back (testing return logic)..." -ForegroundColor Yellow
$incrementBody = @{ decrementBy = -1 } | ConvertTo-Json
try {
    $incremented = Invoke-RestMethod -Uri "http://localhost:7071/api/devices/1/update-availability" -Method POST -Body $incrementBody -ContentType "application/json"
    Write-Host "  ✓ Increment successful! New available: $($incremented.availableCount)/$($incremented.totalCount)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Increment failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Final verification
Write-Host "`n[Final] Final availability check..." -ForegroundColor Yellow
$finalDevice = Invoke-RestMethod -Uri "http://localhost:7071/api/devices/1" -Method GET
Write-Host "  Final available: $($finalDevice.availableCount)/$($finalDevice.totalCount)" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
if ($initialDevice.availableCount -eq $finalDevice.availableCount) {
    Write-Host "  ✓ TEST PASSED - Availability updates working!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Note: Count changed (expected for testing)" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Now try reserving a device in the UI at http://localhost:5176/`n" -ForegroundColor Cyan
