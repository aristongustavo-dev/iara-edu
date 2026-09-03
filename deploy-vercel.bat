@echo off
:: Deploy IARA EDU para Vercel (URL permanente)
:: Requer: npm i -g vercel && vercel login (uma vez)
cd /d "%~dp0"
echo.
echo === IARA EDU - Deploy Vercel ===
echo.
echo 1. Fazendo build...
call npm run build
if %errorlevel% neq 0 (
    echo ERRO no build!
    pause
    exit /b 1
)
echo.
echo 2. Deployando para Vercel...
npx vercel --yes --prod
if %errorlevel% neq 0 (
    echo ERRO no deploy! Execute: vercel login
    pause
    exit /b 1
)
echo.
echo === Deploy concluido! ===
echo Acesse o link acima em qualquer aparelho.
echo.
pause
