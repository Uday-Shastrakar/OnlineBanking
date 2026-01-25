$clientPath = Join-Path $PSScriptRoot "Client-Service/client"

Write-Host "Navigating to Client Service..."
Set-Location $clientPath

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install --legacy-peer-deps
    npm install ajv@8 --legacy-peer-deps
}

Write-Host "Starting Client..."
npm start
