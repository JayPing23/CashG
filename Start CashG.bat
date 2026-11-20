@echo off
title CashG
setlocal
set "ROOT=%~dp0"
set "RUNTIME=%ROOT%app\runtime"
rem Pinned Node build and its official SHA-256 from nodejs.org/dist/v24.22.1/SHASUMS256.txt
set "NODE_VER=v24.22.1"
set "NODE_SHA=d2046d28c2c3dcd211ac5145c0bf30e2047ef9dfb306693c8c6e2eccd8b95fa5"
cd /d "%ROOT%app"

if not exist "public\index.html" (
  echo.
  echo   CashG could not start because the app files are missing.
  echo   Extract the whole downloaded folder first, then run this file again.
  echo.
  pause
  exit /b 1
)

rem 1. Node already downloaded by an earlier run, or shipped in the folder.
set "NODE=%RUNTIME%\node.exe"
if exist "%NODE%" goto start

rem 2. Node 24 or newer already installed on this computer (CashG needs its built-in SQLite).
set "NODE=node"
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 24 ? 0 : 1)" >nul 2>&1 && goto start

rem 3. First run only: download a private copy of Node into app\runtime. Nothing is installed.
echo.
echo   First run: downloading Node.js %NODE_VER% (about 36 MB). This only happens once.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue';" ^
  "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12;" ^
  "$name='node-%NODE_VER%-win-x64'; $zip=Join-Path $env:TEMP 'cashg-node.zip'; $tmp=Join-Path $env:TEMP 'cashg-node';" ^
  "Invoke-WebRequest ('https://nodejs.org/dist/%NODE_VER%/' + $name + '.zip') -OutFile $zip -UseBasicParsing;" ^
  "if ((Get-FileHash $zip -Algorithm SHA256).Hash -ne '%NODE_SHA%') { Remove-Item $zip; throw 'The download was damaged. Run Start CashG again.' };" ^
  "if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }; Expand-Archive $zip $tmp;" ^
  "New-Item -ItemType Directory -Force $env:RUNTIME | Out-Null; Copy-Item (Join-Path $tmp ($name + '\node.exe')) $env:RUNTIME;" ^
  "Remove-Item $zip, $tmp -Recurse -Force"
if errorlevel 1 (
  echo.
  echo   CashG could not download Node.js. Check your internet connection and run this file again.
  echo.
  pause
  exit /b 1
)
set "NODE=%RUNTIME%\node.exe"
echo   Done. Starting CashG...

:start
"%NODE%" --disable-warning=ExperimentalWarning server.js --open
if errorlevel 1 pause
