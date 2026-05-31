#!/usr/bin/env pwsh
# Deploy the Transport Futures site to Netlify from this machine.
#
# Usage:
#   .\deploy.ps1          Publish to production (transportfutures.org)
#   .\deploy.ps1 -Draft   Upload a draft and print a preview URL to check first
#
# Auto-builds are turned off in Netlify, so the live site only updates when
# this runs. Commit your changes first if you also want them in git history.

param([switch]$Draft)

# Run from the project root regardless of where the script is invoked from.
Set-Location $PSScriptRoot

if ($Draft) {
    Write-Host "Deploying a draft preview..." -ForegroundColor Cyan
    netlify deploy
} else {
    Write-Host "Deploying to PRODUCTION (transportfutures.org)..." -ForegroundColor Green
    netlify deploy --prod
}
