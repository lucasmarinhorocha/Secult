#!/bin/bash
set -e

echo "Starting GearOne stack..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Build images if necessary
echo "Building Docker images..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 10

# Run database migrations (if applicable)
# docker-compose exec backend npm run db:migrate

echo "✅ GearOne stack is up and running!"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:3001/api"
echo "  Nginx: http://localhost"
echo ""
echo "Demo credentials:"
echo "  Email: admin@gearone.com"
echo "  Password: admin123"
echo ""
echo "View logs with: docker-compose logs -f"
