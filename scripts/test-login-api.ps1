# Test Login API
# This script tests the login endpoint to see the actual response structure

$apiUrl = "https://sisdik-be-trensains.vercel.app/api/auth/login"

Write-Host "=== Testing Login API ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $apiUrl" -ForegroundColor Yellow
Write-Host ""

# Prompt for credentials
$email = Read-Host "Enter email"
$password = Read-Host "Enter password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Sending request..." -ForegroundColor Yellow

try {
    $body = @{
        email = $email
        password = $passwordPlain
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    
    Write-Host ""
    Write-Host "=== SUCCESS ===" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Cyan
    
    $jsonResponse = $response.Content | ConvertFrom-Json
    $jsonResponse | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host ""
    Write-Host "=== Response Structure ===" -ForegroundColor Cyan
    Write-Host "Has access_token: $($null -ne $jsonResponse.access_token)" -ForegroundColor $(if ($null -ne $jsonResponse.access_token) { "Green" } else { "Red" })
    Write-Host "Has teacher: $($null -ne $jsonResponse.teacher)" -ForegroundColor $(if ($null -ne $jsonResponse.teacher) { "Green" } else { "Red" })
    
    if ($jsonResponse.teacher) {
        Write-Host ""
        Write-Host "Teacher Object:" -ForegroundColor Cyan
        Write-Host "  - id: $($jsonResponse.teacher.id)" -ForegroundColor White
        Write-Host "  - name: $($jsonResponse.teacher.name)" -ForegroundColor White
        Write-Host "  - email: $($jsonResponse.teacher.email)" -ForegroundColor White
        Write-Host "  - nip: $($jsonResponse.teacher.nip)" -ForegroundColor White
    }
    
} catch {
    Write-Host ""
    Write-Host "=== ERROR ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}

Write-Host ""
