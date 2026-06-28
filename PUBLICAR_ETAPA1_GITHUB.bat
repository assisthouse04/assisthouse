@echo off
title ASSISTHOUSE - Publicar no GitHub

echo ================================================================
echo   ETAPA 1 de 3 - Enviar codigo para o GitHub
echo ================================================================
echo.
echo Vou abrir o GitHub para voce criar um repositorio.
echo.
echo Instrucoes:
echo   1. Faca login ou crie uma conta gratuita no GitHub
echo   2. Clique em "New repository"
echo   3. Nome do repositorio: assisthouse
echo   4. Deixe como "Private" (privado)
echo   5. NAO marque nenhuma opcao adicional
echo   6. Clique em "Create repository"
echo   7. Copie o link que aparecer (ex: https://github.com/seuusuario/assisthouse.git)
echo.
echo Pressione qualquer tecla para abrir o GitHub...
pause >nul

start https://github.com/new

echo.
echo ================================================================
echo   Aguardando voce criar o repositorio no GitHub...
echo ================================================================
echo.
echo Depois de criar o repositorio, cole o link aqui e pressione Enter:
echo (Exemplo: https://github.com/josinaldo/assisthouse.git)
echo.
set /p REPO_URL="Cole o link do repositorio: "

echo.
echo Configurando Git e enviando o codigo...
echo.

git init
git add .
git commit -m "Sistema ASSISTHOUSE Informatica - versao inicial"
git branch -M main
git remote add origin %REPO_URL%
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Se aparecer erro de autenticacao, o Git vai abrir uma
    echo janela pedindo login no GitHub. Faca o login normalmente.
    echo.
    echo Tentando novamente...
    git push -u origin main
)

echo.
echo ================================================================
echo   Codigo enviado ao GitHub com sucesso!
echo   Agora execute o arquivo PUBLICAR_ETAPA2_SUPABASE.bat
echo ================================================================
echo.
pause
