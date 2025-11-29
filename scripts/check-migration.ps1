# API Migration Script
# This script helps identify files that need to be updated for the API migration

Write-Host "=== API Migration Helper ===" -ForegroundColor Cyan
Write-Host ""

# Define old endpoints that need to be replaced
$oldEndpoints = @(
    "get-violations-type",
    "add-violation-type",
    "edit-violation-type",
    "delete-violation-type",
    "get-violations-log",
    "add-violation-log",
    "edit-violation-log",
    "delete-violation-log",
    "get-sanctions",
    "get-sanction",
    "add-sanction",
    "edit-sanction",
    "delete-sanction",
    "add-attendance-student",
    "edit-attendance-student",
    "delete-attendance-student",
    "add-mass-attendance-student",
    "get-attendances-month",
    "get-attendances-nis"
)

# Search for files containing old endpoints
$apiPath = "src\app\api"
$filesWithOldEndpoints = @()

Write-Host "Searching for files with old endpoints..." -ForegroundColor Yellow

foreach ($endpoint in $oldEndpoints) {
    $files = Get-ChildItem -Path $apiPath -Recurse -Filter "*.ts" | 
             Select-String -Pattern $endpoint -List | 
             Select-Object -ExpandProperty Path -Unique
    
    if ($files) {
        foreach ($file in $files) {
            if ($filesWithOldEndpoints -notcontains $file) {
                $filesWithOldEndpoints += $file
            }
        }
    }
}

Write-Host ""
Write-Host "Files that need to be updated:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

foreach ($file in $filesWithOldEndpoints) {
    $relativePath = $file.Replace((Get-Location).Path + "\", "")
    Write-Host "  - $relativePath" -ForegroundColor White
}

Write-Host ""
Write-Host "Total files to update: $($filesWithOldEndpoints.Count)" -ForegroundColor Cyan

# Check for old response field references
Write-Host ""
Write-Host "Checking for old response field references..." -ForegroundColor Yellow

$oldFields = @("data.msg", "token.jabatan", "parseInt(id)")
$filesWithOldFields = @()

foreach ($field in $oldFields) {
    $files = Get-ChildItem -Path $apiPath -Recurse -Filter "*.ts" | 
             Select-String -Pattern [regex]::Escape($field) -List | 
             Select-Object -ExpandProperty Path -Unique
    
    if ($files) {
        Write-Host ""
        Write-Host "Files with '$field':" -ForegroundColor Yellow
        foreach ($file in $files) {
            $relativePath = $file.Replace((Get-Location).Path + "\", "")
            Write-Host "  - $relativePath" -ForegroundColor White
            if ($filesWithOldFields -notcontains $file) {
                $filesWithOldFields += $file
            }
        }
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Files with old endpoints: $($filesWithOldEndpoints.Count)" -ForegroundColor White
Write-Host "Files with old field references: $($filesWithOldFields.Count)" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Review the migration guide: docs\API_MIGRATION_GUIDE.md" -ForegroundColor White
Write-Host "2. Update each file listed above" -ForegroundColor White
Write-Host "3. Test the endpoints" -ForegroundColor White
Write-Host "4. Update frontend components" -ForegroundColor White
