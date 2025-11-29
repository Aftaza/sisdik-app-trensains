# Generate NextAuth Secret
# This script generates a secure random secret for NextAuth

Write-Host "=== NextAuth Secret Generator ===" -ForegroundColor Cyan
Write-Host ""

# Generate a random 32-byte secret and convert to base64
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

Write-Host "Generated NEXTAUTH_SECRET:" -ForegroundColor Green
Write-Host $secret -ForegroundColor Yellow
Write-Host ""
Write-Host "Add this to your .env file:" -ForegroundColor Green
Write-Host "NEXTAUTH_SECRET=$secret" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "1. Copy the secret above to your .env file" -ForegroundColor White
Write-Host "2. Clear your browser cookies/cache" -ForegroundColor White
Write-Host "3. Restart your development server" -ForegroundColor White
Write-Host ""
