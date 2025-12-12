#!/bin/bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPHOST_PROJECT="$ROOT_DIR/src/EcommerceDemo.AppHost/EcommerceDemo.AppHost.csproj"
APPHOST_LOG="$ROOT_DIR/.aspire.log"

echo "========================================="
echo "E-commerce Demo - Quick Start (.NET Aspire)"
echo "========================================="
echo ""

if ! command -v dotnet >/dev/null 2>&1; then
    echo "❌ È necessario installare il .NET SDK per avviare l'AppHost."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ È necessario installare Node.js/NPM per avviare il frontend."
    exit 1
fi

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
    echo "❌ Docker deve essere installato e in esecuzione per lanciare Elasticsearch/Kibana."
    exit 1
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
    echo "📦 Installazione dipendenze frontend..."
    (cd "$ROOT_DIR/frontend" && npm install)
fi

wait_for() {
    local url="$1"
    local name="$2"
    local attempts="${3:-30}"

    for ((i=1; i<=attempts; i++)); do
        if curl --silent --fail "$url" >/dev/null 2>&1; then
            echo "✓ $name è pronto"
            return 0
        fi
        sleep 2
    done

    echo "⚠️  Timeout in attesa di $name"
    return 1
}

echo "🚀 Avvio .NET Aspire AppHost..."
dotnet run --project "$APPHOST_PROJECT" > "$APPHOST_LOG" 2>&1 &
APPHOST_PID=$!
echo "   Log disponibili in $APPHOST_LOG"

echo ""
echo "⏳ Attendo Elasticsearch..."
if ! wait_for "http://localhost:9200" "Elasticsearch"; then
    echo "Controlla i log per maggiori dettagli."
    exit 1
fi

echo ""
echo "⏳ Attendo la backend API..."
if ! wait_for "http://localhost:5000/api/brands" "Backend API"; then
    echo "Controlla i log per maggiori dettagli."
    exit 1
fi

echo ""
echo "🌱 Inizializzo l'indice Elasticsearch..."
curl -s -X POST http://localhost:5000/api/init && echo ""

echo "🌱 Genero 100 prodotti di esempio..."
curl -s -X POST "http://localhost:5000/api/seed?count=100" && echo ""

echo ""
echo "========================================="
echo "✅ Setup Aspire completato!"
echo "========================================="
echo ""
echo "🌐 Servizi disponibili:"
echo "   - Frontend:        http://localhost:3000"
echo "   - Backend API:     http://localhost:5000"
echo "   - Elasticsearch:   http://localhost:9200"
echo "   - Kibana:          http://localhost:5601"
echo ""
echo "📝 Comandi utili:"
echo "   curl http://localhost:5000/api/products/search"
echo "   curl http://localhost:5000/api/brands"
echo "   curl http://localhost:5000/api/categories"
echo ""
echo "🛑 Per fermare tutto esegui: kill $APPHOST_PID"
echo "   (oppure interrompi manualmente .NET Aspire AppHost)"
echo ""
