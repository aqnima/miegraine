@echo off
title Miegraine - Development Server
color 0B
cls

echo ===================================================
echo     MIEGRAINE - RETAIL OPERATING SYSTEM
echo     Development Server Launcher
echo ===================================================
echo.
cd /d "%~dp0"

echo [1/3] Memeriksa struktur database...
if not exist "data\local.sqlite" (
    echo [DB] Database lokal baru ditemukan, membuat 20 tabel Drizzle...
    call npx drizzle-kit push
)

echo [2/3] Menyiapkan environment Next.js...
echo.
echo URL Aplikasi: http://localhost:3000
echo Login       : http://localhost:3000/login
echo POS Kasir   : http://localhost:3000/dashboard/pos
echo Superadmin  : http://localhost:3000/superadmin
echo.
echo [3/3] Menjalankan Server... Tekan CTRL + C untuk berhenti.
echo ===================================================
echo.

npm run dev
pause
