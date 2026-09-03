@echo off
:: Watchdog IARA EDU - mantém server e tunnel rodando
:: Executar a cada 2 minutos via tarefa agendada
cd /d "%~dp0"

:: Verifica e reinicia SERVER se necessário
netstat -an 2>nul | findstr ":4173.*LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [%date% %time%] Server reiniciado >> watchdog.log
    start /min "" node server.mjs
    timeout /t 5 >nul
)

:: Verifica e reinicia TUNNEL se necessário
tasklist 2>nul | findstr "cloudflared" >nul 2>&1
if %errorlevel% neq 0 (
    echo [%date% %time%] Tunnel reiniciado >> watchdog.log
    wscript.exe launch-tunnel.vbs
    timeout /t 15 >nul
)
