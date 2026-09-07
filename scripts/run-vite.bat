@echo off
cd /d "%~dp0..\frontend"
call npm run dev -- --port 5173 --strictPort > "C:\Users\LENOVO\AppData\Local\Temp\opencode\vite4.log" 2>&1
