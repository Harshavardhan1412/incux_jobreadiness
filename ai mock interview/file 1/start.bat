@echo off
title HireFlow Launcher
echo ===================================================
echo             Starting HireFlow Services
echo ===================================================
echo.

echo Launching Python Backend API Gateway (Port 8000)...
start "HireFlow - Backend API Gateway" cmd /k "cd /d %~dp0 && (py -3.13 backend\api\app.py || py backend\api\app.py || python backend\api\app.py)"

echo Launching React Frontend Dev Server (Port 5173)...
start "HireFlow - Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Opening HireFlow Frontend in browser...
ping 127.0.0.1 -n 6 >nul
start http://localhost:5173

echo.
echo ===================================================
echo  All HireFlow services have been launched!
echo  - Frontend:     http://localhost:5173
echo  - Backend API:  http://localhost:8000
echo ===================================================
echo.
