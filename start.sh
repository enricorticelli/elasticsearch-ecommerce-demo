#!/bin/bash

echo "========================================="
echo "E-commerce Demo - Quick Start"
echo "========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Start Elasticsearch and Kibana
echo "📦 Starting Elasticsearch and Kibana..."
docker compose up -d elasticsearch kibana

echo "⏳ Waiting for Elasticsearch to be ready (30 seconds)..."
sleep 30

# Check Elasticsearch health
if curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo "✓ Elasticsearch is ready"
else
    echo "⚠️  Elasticsearch might still be starting up"
fi

echo ""
echo "🚀 Starting the backend API..."
cd src/EcommerceDemo.Api
dotnet run --urls http://localhost:5000 &
API_PID=$!
cd ../..

echo "⏳ Waiting for API to start (10 seconds)..."
sleep 10

echo ""
echo "🌱 Initializing Elasticsearch index..."
curl -X POST http://localhost:5000/api/init
echo ""

echo ""
echo "🌱 Seeding 100 sample products..."
curl -X POST "http://localhost:5000/api/seed?count=100"
echo ""

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "🌐 Access the application:"
echo "   - Backend API:    http://localhost:5000"
echo "   - Elasticsearch:  http://localhost:9200"
echo "   - Kibana:         http://localhost:5601"
echo ""
echo "📝 Test the API:"
echo "   curl http://localhost:5000/api/products/search"
echo "   curl http://localhost:5000/api/brands"
echo "   curl http://localhost:5000/api/categories"
echo ""
echo "🛑 To stop the API, run: kill $API_PID"
echo "🛑 To stop all services, run: docker compose down"
echo ""
