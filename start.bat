@echo off
echo =========================================
echo E-commerce Demo - Quick Start
echo =========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo X Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo √ Docker is running
echo.

REM Start Elasticsearch and Kibana
echo Starting Elasticsearch and Kibana...
docker compose up -d elasticsearch kibana

echo Waiting for Elasticsearch to be ready 30 seconds...
timeout /t 30 /nobreak >nul

echo √ Elasticsearch is ready
echo.

echo Starting the backend API...
cd src\EcommerceDemo.Api
start /B dotnet run --urls http://localhost:5000
cd ..\..

echo Waiting for API to start 10 seconds...
timeout /t 10 /nobreak >nul

echo.
echo Initializing Elasticsearch index...
curl -X POST http://localhost:5000/api/init
echo.

echo.
echo Seeding 100 sample products...
curl -X POST "http://localhost:5000/api/seed?count=100"
echo.

echo.
echo =========================================
echo √ Setup Complete!
echo =========================================
echo.
echo Access the application:
echo    - Backend API:    http://localhost:5000
echo    - Elasticsearch:  http://localhost:9200
echo    - Kibana:         http://localhost:5601
echo.
echo Test the API:
echo    curl http://localhost:5000/api/products/search
echo    curl http://localhost:5000/api/brands
echo    curl http://localhost:5000/api/categories
echo.
echo To stop all services, run: docker compose down
echo.
pause
