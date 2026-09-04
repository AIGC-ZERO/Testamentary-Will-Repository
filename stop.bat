@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Daocheng Will Platform - Stop
echo.
echo  ========================================
echo   Daocheng Will Platform - Stop
echo  ========================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop.ps1"
set "CODE=%ERRORLEVEL%"
echo.
pause
endlocal
exit /b %CODE%
