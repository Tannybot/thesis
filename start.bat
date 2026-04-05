@echo off
echo Starting LiveTrack System...

REM Start backend in background
start /B cmd /C "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Start frontend in background
start /B cmd /C "cd frontend && npm run dev"

echo.
echo LiveTrack is starting up...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop all services...
pause > nul

REM Kill processes (this is basic, may need better process management)
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul

echo Services stopped.