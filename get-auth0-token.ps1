#!/usr/bin/env pwsh
# Get Auth0 Access Token for Testing
# This script gets a test token using Resource Owner Password flow

param(
    [string]$Username = "student@test.com",
    [string]$Password = "TestPassword123!"
)

$auth0Domain = "campusdeviceloansystem.uk.auth0.com"
$clientId = "FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M"
$audience = "https://campusdeviceloansystem"

Write-Host "`nGetting Auth0 access token for: $Username" -ForegroundColor Cyan

$body = @{
    grant_type = "password"
    username = $Username
    password = $Password
    audience = $audience
    client_id = $clientId
    scope = "openid profile email"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "https://$auth0Domain/oauth/token" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✓ Token acquired successfully!" -ForegroundColor Green
    Write-Host "`nAccess Token:" -ForegroundColor Yellow
    Write-Host $response.access_token
    Write-Host "`nExpires in: $($response.expires_in) seconds" -ForegroundColor Gray
    
    # Return just the token for piping
    return $response.access_token
} catch {
    Write-Host "✗ Failed to get token" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Enable 'Password' grant type in Auth0 dashboard" -ForegroundColor Gray
    Write-Host "2. Go to Applications → Your App → Advanced Settings → Grant Types" -ForegroundColor Gray
    Write-Host "3. Check 'Password' checkbox and save" -ForegroundColor Gray
    Write-Host "4. Make sure username/password are correct" -ForegroundColor Gray
    Write-Host "5. For testing, you can also get token from browser console:" -ForegroundColor Gray
    Write-Host "   - Login at http://localhost:5176/" -ForegroundColor Gray
    Write-Host "   - Open DevTools console" -ForegroundColor Gray
    Write-Host "   - Run: const auth0 = await import('./src/auth/auth0Client'); const client = await auth0.getAuth0Client(); const token = await client.getTokenSilently(); console.log(token);" -ForegroundColor Gray
    exit 1
}
