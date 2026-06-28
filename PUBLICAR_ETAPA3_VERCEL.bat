@echo off
title ASSISTHOUSE - Publicar no Vercel

echo ================================================================
echo   ETAPA 3 de 3 - Publicar o sistema no Vercel
echo ================================================================
echo.
echo Vou abrir o Vercel para conectar o seu repositorio GitHub.
echo.
echo Instrucoes no Vercel:
echo   1. Clique em "Sign Up" e escolha "Continue with GitHub"
echo   2. Autorize o Vercel a acessar sua conta GitHub
echo   3. Clique em "Add New Project"
echo   4. Selecione o repositorio "assisthouse"
echo   5. Clique em "Import"
echo   6. IMPORTANTE: Antes de clicar em Deploy, va em "Environment Variables"
echo      e adicione as seguintes variaveis:
echo.
echo      Nome: DATABASE_URL
echo      Valor: (cole a URL Transaction Pooler do Supabase)
echo.
echo      Nome: DIRECT_URL
echo      Valor: (cole a URL Direct connection do Supabase)
echo.
echo      Nome: NEXTAUTH_SECRET
echo      Valor: assisthouse-secret-2024-producao
echo.
echo      Nome: NEXTAUTH_URL
echo      Valor: https://assisthouse.vercel.app
echo      (ou o URL que o Vercel mostrar para voce)
echo.
echo   7. Clique em "Deploy" e aguarde ~2 minutos
echo   8. Pronto! O sistema estara online!
echo.
echo Pressione qualquer tecla para abrir o Vercel...
pause >nul

start https://vercel.com/new

echo.
echo ================================================================
echo.
echo Aguardando o deploy no Vercel...
echo.
echo Quando o deploy terminar, volte aqui e pressione qualquer tecla.
pause >nul

echo.
echo ================================================================
echo   SISTEMA PUBLICADO COM SUCESSO!
echo.
echo   Seu sistema esta disponivel na internet!
echo.
echo   Acesse: https://assisthouse.vercel.app
echo   (ou o endereco que o Vercel mostrou para voce)
echo.
echo   Login:  admin@assisthouse.com
echo   Senha:  admin123
echo.
echo   LEMBRE-SE: Altere a senha apos o primeiro acesso!
echo ================================================================
echo.
pause
