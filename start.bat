@echo off
chcp 949 > nul
title Financial Dashboard - Starting...

echo.
echo =======================================
echo     Financial Dashboard
echo        System Starting...
echo =======================================
echo.

:: Node.js install check
node --version > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed.
    echo Please download from https://nodejs.org
    pause
    exit /b 1
)

:: NPM version display
echo [OK] Node.js version:
node --version
echo.

:: Current directory check
if not exist "package.json" (
    echo [ERROR] Wrong folder. Please run from project root folder.
    pause
    exit /b 1
)

if not exist "backend\package.json" (
    echo [ERROR] Backend folder not found. Please check project structure.
    pause
    exit /b 1
)

echo [INFO] Installing dependencies...
echo.

:: Frontend dependencies install
echo [1/2] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Frontend dependencies install failed
    pause
    exit /b 1
)

:: Backend dependencies install
echo [2/2] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo [ERROR] Backend dependencies install failed
    pause
    exit /b 1
)
cd ..

echo.
echo [OK] Dependencies installation completed!
echo.

:: Server start message
echo =======================================
echo       Starting Servers...
echo =======================================
echo.
echo Backend Server: http://localhost:3007
echo Frontend Server: http://localhost:3003
echo.
echo Please wait for servers to fully start...
echo (About 10-15 seconds)
echo.

:: Start backend server (background)
echo Starting backend server...
cd backend
start "Backend Server" cmd /k "echo Backend Server (Port 3007) && node server.js"
cd ..

:: Wait a bit before starting frontend server
timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "echo Frontend Server (Port 3003) && npm run dev"

:: Auto open browser (after 10 seconds)
timeout /t 10 /nobreak > nul
echo.
echo Opening application in browser...
start http://localhost:3003

echo.
echo =======================================
echo         Startup Complete!
echo =======================================
echo.
echo Important Notes:
echo   - Two server windows have opened
echo   - To stop: Press Ctrl+C in each window
echo   - Or run 'stop.bat' file
echo.
echo Financial Dashboard is ready!
echo Check http://localhost:3003 in your browser
echo.

pause