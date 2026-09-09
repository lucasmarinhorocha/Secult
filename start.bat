@echo off
setlocal enabledelayedexpansion

echo Starting GearOne stack...

REM Check if .env exists
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)

REM Build images if necessary
echo Building Docker images...
docker-compose build

REM Start services
echo Starting services...
docker-compose up -d

REM Wait for services to be healthy
echo Waiting for services to be healthy...
timeout /t 10 /nobreak

REM Run database migrations (if applicable)
REM docker-compose exec backend npm run db:migrate

echo.
echo ✅ GearOne stack is up and running!
echo.
echo URLs:
echo   Frontend: http://localhost:3000
echo   API: http://localhost:3001/api
echo   Nginx: http://localhost
echo.
echo Demo credentials:
echo   Email: admin@gearone.com
echo   Password: admin123
echo.
echo View logs with: docker-compose logs -f
