@echo off
setlocal
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev-stack.ps1" %*
exit /b %ERRORLEVEL%
