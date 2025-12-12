@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
pushd "%ROOT%"

echo =========================================
echo E-commerce Demo - Quick Start (.NET Aspire)
echo =========================================
echo.

call :CheckCommand dotnet ".NET SDK"
if errorlevel 1 exit /b 1
call :CheckCommand npm "Node.js / NPM"
if errorlevel 1 exit /b 1

docker info >nul 2>&1
if errorlevel 1 (
    echo X Docker non e' attivo. Avvia Docker Desktop e riprova.
    goto :error
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    pushd frontend
    call npm install
    if errorlevel 1 goto :error
    popd
)

echo.
echo Starting .NET Aspire AppHost in a new window...
start "Aspire AppHost" cmd /k "cd /d ""%ROOT%src\EcommerceDemo.AppHost"" && dotnet run"
echo.

call :WaitForUrl "http://localhost:9200" "Elasticsearch"
if errorlevel 1 goto :error

call :WaitForUrl "http://localhost:5000/api/brands" "Backend API"
if errorlevel 1 goto :error

echo.
echo Initializing Elasticsearch index...
curl -s -X POST http://localhost:5000/api/init
echo.

echo Seeding 100 sample products...
curl -s -X POST "http://localhost:5000/api/seed?count=100"
echo.

echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo Services:
echo    - Frontend:       http://localhost:3000
echo    - Backend API:    http://localhost:5000
echo    - Elasticsearch:  http://localhost:9200
echo    - Kibana:         http://localhost:5601
echo.
echo Test the API:
echo    curl http://localhost:5000/api/products/search
echo    curl http://localhost:5000/api/brands
echo    curl http://localhost:5000/api/categories
echo.
echo Stop everything by closing the "Aspire AppHost" window or pressing CTRL+C inside it.
echo.
pause
goto :eof

:CheckCommand
%1 --version >nul 2>&1
if errorlevel 1 (
    echo X %2 non trovato. Installalo e riprova.
    exit /b 1
)
exit /b 0

:WaitForUrl
set "URL=%~1"
set "NAME=%~2"
powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue';$max=30;for($i=0;$i -lt $max;$i++){try{Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 5 ^| Out-Null;exit 0}catch{Start-Sleep -Seconds 2}};exit 1"
if errorlevel 1 (
    echo Timeout waiting for %NAME%. Check the Aspire window for details.
    exit /b 1
)
echo %NAME% is ready.
exit /b 0

:error
echo Failed to complete setup. Verify the Aspire AppHost window for errors.
exit /b 1
