# Start only Postgres for local backend development.
# Run this in your own terminal (where Docker works), then run the backend with uvicorn.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
docker-compose up -d postgres
Write-Host "Waiting for Postgres to be healthy..."
Start-Sleep -Seconds 5
docker-compose ps postgres
