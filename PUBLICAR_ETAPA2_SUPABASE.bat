@echo off
title ASSISTHOUSE - Configurar Banco de Dados Supabase

echo ================================================================
echo   ETAPA 2 de 3 - Configurar banco de dados no Supabase
echo ================================================================
echo.
echo Vou abrir o Supabase para voce criar o banco de dados gratuito.
echo.
echo Instrucoes no Supabase:
echo   1. Clique em "Start your project" e crie uma conta gratuita
echo   2. Clique em "New Project"
echo   3. Nome: assisthouse
echo   4. Crie uma senha forte e ANOTE (ex: Assisthouse@2024)
echo   5. Regiao: South America (Sao Paulo)
echo   6. Clique em "Create new project" e aguarde ~2 minutos
echo   7. Apos criar, va em: Settings > Database
echo   8. Procure "Connection string" e selecione "URI"
echo   9. Voce vai precisar de duas URLs:
echo      - Transaction pooler (porta 6543)
echo      - Direct connection (porta 5432)
echo.
echo Pressione qualquer tecla para abrir o Supabase...
pause >nul

start https://supabase.com/dashboard/new

echo.
echo ================================================================
echo   Cole as informacoes do Supabase abaixo
echo ================================================================
echo.
echo Cole a URL "Transaction Pooler" (porta 6543):
echo Exemplo: postgresql://postgres.xxx:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
echo.
set /p DB_URL="Transaction Pooler URL: "

echo.
echo Cole a URL "Direct connection" (porta 5432):
echo Exemplo: postgresql://postgres.xxx:[SENHA]@db.xxx.supabase.co:5432/postgres
echo.
set /p DIRECT_URL="Direct connection URL: "

echo.
echo Atualizando o arquivo .env com as URLs do banco...

(
echo # Banco de dados Supabase
echo DATABASE_URL="%DB_URL%"
echo DIRECT_URL="%DIRECT_URL%"
echo.
echo NEXTAUTH_SECRET="assisthouse-secret-2024-producao"
echo NEXTAUTH_URL="https://assisthouse.vercel.app"
) > .env.production

echo.
echo Criando as tabelas no banco de dados...
set DATABASE_URL=%DB_URL%
set DIRECT_URL=%DIRECT_URL%
call npx prisma db push

echo.
echo Criando usuario administrador no banco...
call npm run db:seed

echo.
echo ================================================================
echo   Banco de dados configurado com sucesso!
echo.
echo   Guarde estas informacoes para a proxima etapa:
echo   DATABASE_URL: %DB_URL%
echo   DIRECT_URL:   %DIRECT_URL%
echo.
echo   Agora execute o arquivo PUBLICAR_ETAPA3_VERCEL.bat
echo ================================================================
echo.
pause
