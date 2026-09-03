@echo off
cd /d "%~dp0"
C:\tools\cloudflared.exe tunnel --url http://localhost:4173 --no-autoupdate > cloudflared.log 2>&1
