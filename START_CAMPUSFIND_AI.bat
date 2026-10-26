@echo off
title CampusFind AI Launcher
echo ========================================================
echo   Launching CampusFind AI Platform...
echo ========================================================
cd /d "%~dp0"
start http://127.0.0.1:5173/
cmd.exe /c npm.cmd run dev -- --host 127.0.0.1 --port 5173
pause
