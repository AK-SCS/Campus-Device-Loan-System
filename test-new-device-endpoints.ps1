
# Test New Device Catalogue Endpoints
# This script tests all the new endpoints added to the Device Catalogue Service

Write-Host "`n========== TESTING NEW DEVICE CATALOGUE ENDPOINTS ==========`n" -ForegroundColor Cyan

# Base URL
$baseUrl = "http://localhost:7071/api"

# Test 1: Search devices by category
Write-Host "Test 1: Search devices by category (laptops)" -ForegroundColor Yellow
try {
    $laptops = Invoke-RestMethod -Uri "$baseUrl/devices?category=laptop" -Method GET
    Write-Host "✅ Found $($laptops.Count) laptops" -ForegroundColor Green
    Write-Host "   First laptop: $($laptops[0].brand) $($laptops[0].model)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Search available devices only
Write-Host "Test 2: Search available devices only" -ForegroundColor Yellow
try {
    $available = Invoke-RestMethod -Uri "$baseUrl/devices?availableOnly=true" -Method GET
    Write-Host "✅ Found $($available.Count) available devices" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Add a new device
Write-Host "Test 3: Add a new device (Surface Pro 9)" -ForegroundColor Yellow
try {
    $newDevice = @{
        brand = "Microsoft"
        model = "Surface Pro 9"
        category = "tablet"
        totalCount = 8
        availableCount = 8
    }
    $created = Invoke-RestMethod -Uri "$baseUrl/devices" -Method POST -ContentType "application/json" -Body ($newDevice | ConvertTo-Json)
    Write-Host "✅ Device created with ID: $($created.id)" -ForegroundColor Green
    Write-Host "   $($created.brand) $($created.model) - $($created.availableCount)/$($created.totalCount) available" -ForegroundColor Gray
    $createdId = $created.id
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Update device availability (decrease by 2)
Write-Host "Test 4: Update device availability (decrease by 2)" -ForegroundColor Yellow
if ($createdId) {
    try {
        $update = @{ change = -2 }
        $updated = Invoke-RestMethod -Uri "$baseUrl/devices/$createdId/availability" -Method PATCH -ContentType "application/json" -Body ($update | ConvertTo-Json)
        Write-Host "✅ Availability updated: $($updated.availableCount)/$($updated.totalCount) available" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped (no device created)" -ForegroundColor Gray
}

Write-Host ""

# Test 5: Update device details
Write-Host "Test 5: Update device details" -ForegroundColor Yellow
if ($createdId) {
    try {
        $deviceUpdate = @{
            totalCount = 10
        }
        $updated = Invoke-RestMethod -Uri "$baseUrl/devices/$createdId" -Method PUT -ContentType "application/json" -Body ($deviceUpdate | ConvertTo-Json)
        Write-Host "✅ Device updated: Total count now $($updated.totalCount)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped (no device created)" -ForegroundColor Gray
}

Write-Host ""

# Test 6: Get device by ID
Write-Host "Test 6: Get device by ID" -ForegroundColor Yellow
if ($createdId) {
    try {
        $device = Invoke-RestMethod -Uri "$baseUrl/devices/$createdId" -Method GET
        Write-Host "✅ Retrieved device: $($device.brand) $($device.model)" -ForegroundColor Green
        Write-Host "   Category: $($device.category), Available: $($device.availableCount)/$($device.totalCount)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped (no device created)" -ForegroundColor Gray
}

Write-Host ""

# Test 7: Search tablets with minimum availability
Write-Host "Test 7: Search tablets with minimum availability of 3" -ForegroundColor Yellow
try {
    $tablets = Invoke-RestMethod -Uri "$baseUrl/devices?category=tablet&minAvailability=3" -Method GET
    Write-Host "✅ Found $($tablets.Count) tablets with 3+ available" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Delete device
Write-Host "Test 8: Delete device" -ForegroundColor Yellow
if ($createdId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/devices/$createdId" -Method DELETE
        Write-Host "✅ Device deleted successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped (no device created)" -ForegroundColor Gray
}

Write-Host ""

# Test 9: Verify device was deleted
Write-Host "Test 9: Verify device was deleted" -ForegroundColor Yellow
if ($createdId) {
    try {
        $device = Invoke-RestMethod -Uri "$baseUrl/devices/$createdId" -Method GET
        Write-Host "❌ Device still exists (should have been deleted)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "✅ Device not found (correctly deleted)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⏭️  Skipped (no device created)" -ForegroundColor Gray
}

Write-Host "`n========== TEST SUMMARY ==========`n" -ForegroundColor Cyan
Write-Host "All new endpoints have been tested!" -ForegroundColor Green
Write-Host ""
Write-Host "New endpoints available:" -ForegroundColor White
Write-Host "  • GET    /api/devices?category=X&availableOnly=true&minAvailability=N" -ForegroundColor Gray
Write-Host "  • POST   /api/devices" -ForegroundColor Gray
Write-Host "  • PUT    /api/devices/{id}" -ForegroundColor Gray
Write-Host "  • DELETE /api/devices/{id}" -ForegroundColor Gray
Write-Host "  • PATCH  /api/devices/{id}/availability" -ForegroundColor Gray
Write-Host ""
