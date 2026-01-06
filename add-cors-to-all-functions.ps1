# PowerShell script to add CORS headers to all Azure Functions
# This script updates all HTTP function files to include CORS headers

Write-Host "`n=== Adding CORS Headers to All Functions ===`n" -ForegroundColor Cyan

$services = @(
    "c:\Users\kalea\source\repos\Campus-Device-Loan-System\device-catalogue-service",
    "c:\Users\kalea\source\repos\Campus-Device-Loan-System\loan-service"
)

foreach ($service in $services) {
    Write-Host "Processing: $service" -ForegroundColor Yellow
    
    # Find all HTTP function files
    $files = Get-ChildItem -Path "$service\src\functions" -Filter "*-http.ts" -Recurse
    
    foreach ($file in $files) {
        Write-Host "  Updating: $($file.Name)" -ForegroundColor White
        
        $content = Get-Content $file.FullName -Raw
        
        # Add CORS import if not present
        if ($content -notmatch "import.*getCorsHeaders") {
            $content = $content -replace "(import.*from '@azure/functions';)", "`$1`nimport { getCorsHeaders } from '../utils/cors.js';"
        }
        
        # Replace headers without CORS
        $content = $content -replace "headers: \{`n\s+'Content-Type': 'application/json'`n\s+\}", "headers: {`n        'Content-Type': 'application/json',`n        ...getCorsHeaders()`n      }"
        
        # Add OPTIONS to methods if not present
        $content = $content -replace "methods: \['(GET|POST|PUT|DELETE|PATCH)'\]", "methods: ['`$1', 'OPTIONS']"
        
        Set-Content -Path $file.FullName -Value $content
    }
}

Write-Host "`n✅ CORS headers added to all functions!`n" -ForegroundColor Green
