@echo off
title Miegraine POS - Dev Toolkit Menu
color 0A
cd /d "%~dp0"

:MENU
cls
echo =========================================================
echo       MIEGRAINE POS & MINI-ERP - DEV TOOLKIT
echo       Asisten: Jule (주리) | Khusus: Bos Besar Banget
echo =========================================================
echo.
echo   [1] Jalankan Server Development  (npm run dev)
echo   [2] Buka Drizzle Studio Visual   (npx drizzle-kit studio)
echo   [3] Push Skema Database D1       (npx drizzle-kit push)
echo   [4] Generate Migrasi Database    (npm run db:generate)
echo   [5] Install Dependencies         (npm install)
echo   [6] Build Production Check       (npm run build)
echo   [0] Keluar
echo.
echo =========================================================
set /p opt="Pilih menu [0-6]: "

if "%opt%"=="1" goto RUN_DEV
if "%opt%"=="2" goto RUN_STUDIO
if "%opt%"=="3" goto RUN_PUSH
if "%opt%"=="4" goto RUN_GENERATE
if "%opt%"=="5" goto RUN_INSTALL
if "%opt%"=="6" goto RUN_BUILD
if "%opt%"=="0" exit
goto MENU

:RUN_DEV
cls
color 0B
echo Menjalankan Next.js Dev Server...
echo Buka browser di http://localhost:3000
npm run dev
pause
goto MENU

:RUN_STUDIO
cls
color 0E
echo Membuka Drizzle Studio (Database GUI Visual)...
npx drizzle-kit studio
pause
goto MENU

:RUN_PUSH
cls
color 0D
echo Menerapkan skema ke SQLite D1...
npx drizzle-kit push
pause
goto MENU

:RUN_GENERATE
cls
color 09
echo Membuat berkas migrasi SQL...
npm run db:generate
pause
goto MENU

:RUN_INSTALL
cls
color 0F
echo Menginstall paket dependencies...
npm install
pause
goto MENU

:RUN_BUILD
cls
color 0C
echo Memeriksa build production...
npm run build
pause
goto MENU
