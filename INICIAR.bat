@echo off
chcp 65001 >nul
title ASSISTHOUSE - Sistema em Execucao
color 1F
cls

echo ================================================================
echo   ASSISTHOUSE INFORMATICA - Iniciando Sistema
echo ================================================================
echo.
echo   Aguarde... o servidor esta iniciando.
echo   Acesse: http://localhost:3000
echo.
echo   Para encerrar, feche esta janela.
echo ================================================================
echo.

start http://localhost:3000
npm run dev
