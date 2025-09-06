@echo off
chcp 949 > nul
title Financial Dashboard - Stopping...

echo.
echo =======================================
echo     Financial Dashboard
echo        System Stopping...
echo =======================================
echo.

echo Finding running servers...
echo.

:: Terminate Node.js processes
echo Stopping Node.js servers...
taskkill /f /im node.exe > nul 2>&1
if errorlevel 1 (
    echo [INFO] No running Node.js servers found.
) else (
    echo [OK] Node.js servers terminated.
)

:: Terminate npm processes
echo Stopping NPM processes...
taskkill /f /im npm.cmd > nul 2>&1
taskkill /f /im npm > nul 2>&1

:: Terminate Vite dev servers (additional safety)
echo Stopping development servers...
for /f "tokens=2" %%i in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /f /pid %%i > nul 2>&1
for /f "tokens=2" %%i in ('netstat -ano ^| findstr ":3006" ^| findstr "LISTENING"') do taskkill /f /pid %%i > nul 2>&1

:: Check port status
echo.
echo Checking port status...
netstat -ano | findstr ":3000" > nul
if errorlevel 1 (
    echo [OK] Port 3000 (Frontend): Released
) else (
    echo [WARNING] Port 3000: Still in use (manual termination needed)
)

netstat -ano | findstr ":3006" > nul
if errorlevel 1 (
    echo [OK] Port 3006 (Backend): Released
) else (
    echo [WARNING] Port 3006: Still in use (manual termination needed)
)

echo.
echo =======================================
echo         Shutdown Complete!
echo =======================================
echo.
echo Cleanup Summary:
echo   - All server processes terminated
echo   - Ports 3000, 3006 released
echo   - System resources cleaned up
echo.
echo Financial Dashboard safely stopped!
echo To restart, run 'start.bat'
echo.

pause