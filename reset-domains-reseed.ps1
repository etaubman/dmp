# Reset domain-related data and re-seed with current hierarchy (L0 Markets, L0 Banking, etc.).
# Run from repo root. Requires backend venv and DATABASE_URL (or .env).
Set-Location $PSScriptRoot
if (Test-Path "backend\venv\Scripts\Activate.ps1") {
    & "backend\venv\Scripts\Activate.ps1"
}
Set-Location backend; python -m app.seed reset
