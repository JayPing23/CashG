# Builds the folder that goes on Google Drive. Zip the folder yourself afterwards.
# Run from the project root:  powershell -ExecutionPolicy Bypass -File scripts\package.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'release\CashG'

if (-not (Test-Path (Join-Path $root 'app\public\index.html'))) {
  throw 'The interface has not been built. Run "npm run build" inside the web folder first.'
}

if (Test-Path (Join-Path $root 'release')) { Remove-Item -Recurse -Force (Join-Path $root 'release') }
New-Item -ItemType Directory -Force (Join-Path $out 'app\runtime') | Out-Null

Copy-Item (Join-Path $root 'Start CashG.bat') $out
Copy-Item (Join-Path $root 'docs\How to test CashG.md') $out
Copy-Item (Join-Path $root 'app\server.js') (Join-Path $out 'app')
Copy-Item (Join-Path $root 'app\config.json') (Join-Path $out 'app')
Copy-Item -Recurse (Join-Path $root 'app\public') (Join-Path $out 'app\public')

# Ship the same Node this project was tested with, so testers need nothing installed.
$node = (Get-Command node).Source
Copy-Item $node (Join-Path $out 'app\runtime\node.exe')
& $node --version | Set-Content (Join-Path $out 'app\runtime\version.txt')

Write-Host "Created $out. Zip this CashG folder and upload it to Google Drive."
