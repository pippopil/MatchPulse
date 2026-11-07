@echo off
chcp 65001 >nul
title MatchPulse - Футбольный аналитический парсер
cd /d "%~dp0"

echo ======================================================================
echo           ⚽ MatchPulse — Аналитический парсер футбола
echo      Flashscore Live (140+ в эфире) ^| Fonbet Линия ^| Recharts
echo ======================================================================
echo.

:: 1. Определение исполняемого файла Node.js
set "NODE_EXEC="

:: Проверяем, установлен ли Node в системе
where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_EXEC=node"
    echo [✓] Обнаружен системный Node.js:
    node -v
    goto :CHECK_SERVER
)

:: Проверяем локальный портативный Node в папке bin\
if exist "%~dp0bin\node.exe" (
    set "NODE_EXEC=%~dp0bin\node.exe"
    echo [✓] Обнаружен локальный портативный Node.js в папке bin/
    goto :CHECK_SERVER
)

:: Если Node не найден нигде — скачиваем автономный node.exe за 3-5 секунд без прав админа
echo [1/2] Node.js не установлен на компьютере.
echo Загрузка официального портативного node.exe (~35 МБ) в папку bin\...
echo (Это разовая операция, установка в Windows не требуется)
echo.

if not exist "%~dp0bin" mkdir "%~dp0bin"

:: Сначала пробуем встроенный в Windows 10/11 curl
where curl >nul 2>nul
if %errorlevel% equ 0 (
    curl -# -fSL "https://nodejs.org/dist/v20.18.0/win-x64/node.exe" -o "%~dp0bin\node.exe"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $w = New-Object System.Net.WebClient; $w.DownloadFile('https://nodejs.org/dist/v20.18.0/win-x64/node.exe', '%~dp0bin\node.exe')"
)

if exist "%~dp0bin\node.exe" (
    set "NODE_EXEC=%~dp0bin\node.exe"
    echo.
    echo [✓] Портативный модуль успешно загружен!
) else (
    echo.
    echo [ОШИБКА] Не удалось автоматически скачать портативный node.exe.
    echo Пожалуйста, установите Node.js с официального сайта: https://nodejs.org/
    pause
    exit /b 1
)

:CHECK_SERVER
echo.
if not exist "%~dp0server.js" (
    echo [ОШИБКА] Файл server.js не найден.
    pause
    exit /b 1
)

echo [2/2] Запуск автономного сервера MatchPulse...
echo 🌐 Открытие приложения: http://localhost:3000
echo.
echo ======================================================================
echo    Для завершения работы программы просто закройте это окно.
echo ======================================================================
echo.

:: Открываем приложение как отдельное нативное окно через Edge App Mode, либо в стандартном браузере
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start "" msedge.exe --app="http://localhost:3000" --window-size=1340,900
) else (
    start "" "http://localhost:3000"
)

:: Запуск встроенного сервера
%NODE_EXEC% "%~dp0server.js"

pause
