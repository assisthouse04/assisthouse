@echo off
title ASSISTHOUSE - Instalacao do Sistema

echo ================================================================
echo   ASSISTHOUSE INFORMATICA - Instalacao do Sistema
echo ================================================================
echo.

echo [1/4] Instalando dependencias (pode demorar alguns minutos)...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias. Verifique o erro acima.
    pause
    exit /b 1
)

echo.
echo [2/4] Criando banco de dados SQLite...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao criar banco de dados.
    pause
    exit /b 1
)

echo.
echo [3/4] Criando usuario administrador...
call npm run db:seed

echo.
echo [4/4] Abrindo o sistema no navegador...
echo.
echo ================================================================
echo   Instalacao concluida com sucesso!
echo.
echo   Acesse: http://localhost:3000
echo   Login:  admin@assisthouse.com
echo   Senha:  admin123
echo ================================================================
echo.
echo Pressione qualquer tecla para iniciar...
pause >nul

start http://localhost:3000
npm run dev
