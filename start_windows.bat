@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1
title MatchPulse - Футбольный аналитический парсер

:: Переходим в папку расположения скрипта (критично для "Запуск от имени администратора")
cd /d "%~dp0"

echo ======================================================================
echo           MatchPulse - Аналитический парсер футбола
echo      Главный ^| Источник 1 ^| Источник 3 ^| Источник 4
echo ======================================================================
echo.

:: 1. Поиск исполняемого файла Node.js
set "NODE_CMD="

:: Проверка в стандартном системном PATH
where node.exe >nul 2>&1
if not errorlevel 1 goto :SET_NODE_PATH

where node >nul 2>&1
if not errorlevel 1 goto :SET_NODE_PATH

:: Проверка типовых путей установки Node.js в Windows
if exist "%ProgramFiles%\nodejs\node.exe" goto :SET_NODE_PF
if exist "%ProgramFiles(x86)%\nodejs\node.exe" goto :SET_NODE_PF86
if exist "%LocalAppData%\Programs\node\node.exe" goto :SET_NODE_LOCAL
if exist "%AppData%\nvm\current\node.exe" goto :SET_NODE_NVM

:: Проверка локального портативного node.exe в папке bin\
if exist "%~dp0bin\node.exe" goto :SET_NODE_PORTABLE

:: Если Node.js не найден — пробуем автоматически скачать автономный модуль
echo [1/2] Node.js не обнаружен на компьютере.
echo Загрузка официального автономного node.exe (~35 МБ) в папку bin\...
echo (Установка в систему не требуется, это разовая загрузка)
echo.

if not exist "%~dp0bin" mkdir "%~dp0bin"

where curl.exe >nul 2>&1
if not errorlevel 1 goto :DOWNLOAD_CURL

where curl >nul 2>&1
if not errorlevel 1 goto :DOWNLOAD_CURL

where powershell.exe >nul 2>&1
if not errorlevel 1 goto :DOWNLOAD_PS

where powershell >nul 2>&1
if not errorlevel 1 goto :DOWNLOAD_PS

goto :DOWNLOAD_ERROR

:DOWNLOAD_CURL
echo [Загрузка через curl...]
curl.exe -# -fSL "https://nodejs.org/dist/v20.18.0/win-x64/node.exe" -o "%~dp0bin\node.exe"
goto :VERIFY_DOWNLOAD

:DOWNLOAD_PS
echo [Загрузка через PowerShell...]
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.18.0/win-x64/node.exe', '%~dp0bin\node.exe')"
goto :VERIFY_DOWNLOAD

:VERIFY_DOWNLOAD
if exist "%~dp0bin\node.exe" goto :SET_NODE_PORTABLE

:DOWNLOAD_ERROR
echo.
echo ======================================================================
echo [ОШИБКА] Не удалось автоматически скачать портативный node.exe.
echo Пожалуйста, установите Node.js (версия LTS) с официального сайта:
echo    https://nodejs.org/
echo После установки просто запустите этот файл снова.
echo ======================================================================
echo.
pause
exit /b 1

:SET_NODE_PATH
set "NODE_CMD=node"
goto :CHECK_NODE_VERSION

:SET_NODE_PF
set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
goto :CHECK_NODE_VERSION

:SET_NODE_PF86
set "NODE_CMD=%ProgramFiles(x86)%\nodejs\node.exe"
goto :CHECK_NODE_VERSION

:SET_NODE_LOCAL
set "NODE_CMD=%LocalAppData%\Programs\node\node.exe"
goto :CHECK_NODE_VERSION

:SET_NODE_NVM
set "NODE_CMD=%AppData%\nvm\current\node.exe"
goto :CHECK_NODE_VERSION

:SET_NODE_PORTABLE
set "NODE_CMD=%~dp0bin\node.exe"
goto :CHECK_NODE_VERSION

:CHECK_NODE_VERSION
echo [✓] Обнаружен Node.js:
"%NODE_CMD%" -v
echo.

:: 2. Проверка наличия server.js
if exist "%~dp0server.js" goto :START_APP

echo [!] Файл server.js не найден в %~dp0
echo Попытка автоматической сборки проекта...
where npm.exe >nul 2>&1
if not errorlevel 1 goto :RUN_NPM_BUILD
where npm >nul 2>&1
if not errorlevel 1 goto :RUN_NPM_BUILD
goto :SERVER_MISSING_ERROR

:RUN_NPM_BUILD
call npm run build
if exist "%~dp0server.js" goto :START_APP

:SERVER_MISSING_ERROR
echo.
echo ======================================================================
echo [ОШИБКА] Файл server.js отсутствует.
echo Соберите проект командой: npm run build
echo ======================================================================
echo.
pause
exit /b 1

:START_APP
echo [2/2] Запуск автономного сервера MatchPulse...
echo 🌐 Адрес приложения: http://localhost:3000
echo.
echo ======================================================================
echo    Для завершения работы программы просто закройте это окно.
echo ======================================================================
echo.

:: Фоновое открытие браузера через 1 секунду после старта
start "" /b cmd /c "timeout /t 1 /nobreak >nul 2>&1 & start http://localhost:3000"

:: Запуск сервера MatchPulse
"%NODE_CMD%" "%~dp0server.js"

if errorlevel 1 (
    echo.
    echo ======================================================================
    echo [ОШИБКА] Сервер завершил работу с ошибкой.
    echo ======================================================================
    echo.
    pause
) else (
    echo.
    echo Сервер MatchPulse остановлен.
    pause
)
