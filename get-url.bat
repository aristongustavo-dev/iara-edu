@echo off
:: Extrai URL atual do cloudflared.log
cd /d "%~dp0"
for /f "tokens=*" %%a in ('findstr /r "https://[a-z]*-[a-z]*-[a-z]*\.trycloudflare\.com" cloudflared.log 2^>nul') do (
    for /f "tokens=*" %%b in ("%%a") do (
        for /f "tokens=3 delims=|" %%c in ("%%b") do (
            > watchdog-url.txt echo %%c
        )
    )
)
if exist watchdog-url.txt (
    echo URL atual:
    type watchdog-url.txt
) else (
    echo Nenhum URL encontrado
)
