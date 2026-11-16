@echo off
title CashG
cd /d "%~dp0app"

rem Use the copy of Node that ships in this folder; fall back to one installed on the computer.
set "NODE=%~dp0app\runtime\node.exe"
if not exist "%NODE%" set "NODE=node"

"%NODE%" --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo   CashG could not start because Node.js was not found.
  echo   Ask the CashG team for the full download, which includes it.
  echo.
  pause
  exit /b 1
)

if not exist "public\index.html" (
  echo.
  echo   CashG could not start because the app files are missing.
  echo   Extract the whole zip folder first, then run this file again.
  echo.
  pause
  exit /b 1
)

"%NODE%" --disable-warning=ExperimentalWarning server.js --open
if errorlevel 1 pause
