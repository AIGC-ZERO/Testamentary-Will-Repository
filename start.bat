@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Daocheng Will Platform - Start
echo.
echo  ========================================
echo   Daocheng Will Platform - Local Start
echo  ========================================
echo.
where powershell >nul 2>nul
if errorlevel 1 (
  echo [ERROR] PowerShell not found.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1"
set "CODE=%ERRORLEVEL%"
echo.
if not "%CODE%"=="0" (
  echo [FAIL] Start failed, code %CODE%.
) else (
  echo [DONE] You can close this window. Service keeps running in background.
)
echo.
pause
endlocal
exit /b %CODE%
