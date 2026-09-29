@echo off
title InterviewIQ Launcher
echo ===================================================
echo           Starting InterviewIQ Services
echo ===================================================
echo.

echo Launching Python AI Engine (Port 8000)...
start "InterviewIQ - Python AI" cmd /k "cd /d %~dp0python-ai && (if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" ("%LOCALAPPDATA%\Programs\Python\Python311\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload) else (python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload))"

echo Launching Node.js Express Server and PincuxAI Frontend (Port 5000)...
start "InterviewIQ - Express Server and Frontend" cmd /k "cd /d %~dp0server && npm run dev"

echo Opening PincuxAI Frontend in browser...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5000

echo.
echo ===================================================
echo  All services have been launched!
echo  - PincuxAI Frontend: http://localhost:5000
echo  - Express Backend:   http://localhost:5000/api
echo  - Python AI Engine:  http://localhost:8000
echo ===================================================
echo.
