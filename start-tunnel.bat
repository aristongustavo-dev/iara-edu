@echo off
cd /d "%~dp0"
echo [%date% %time%] Starting cloudflared tunnel... >> cloudflared.log
C:\tools\cloudflared.exe tunnel --url http://localhost:4173 --no-autoupdate >> cloudflared.log 2>&1
echo [%date% %time%] cloudflared exited >> cloudflared.log
