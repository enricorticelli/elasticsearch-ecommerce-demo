# Elasticsearch E-commerce Demo

Demo ricerca prodotti Ecommerce con .NET 10, Elasticsearch, Kibana e Next.js

## Architettura

Questa è un'applicazione e-commerce completa con:

- **Backend**: .NET 10 con Minimal APIs
- **Database**: Elasticsearch 8.11 per ricerca full-text
- **Visualizzazione**: Kibana per monitoraggio ed analytics
- **Frontend**: Next.js 16 con TypeScript e Tailwind CSS
- **Orchestrazione**: Docker Compose

## Funzionalità

### Backend API (.NET 10)

- **POST /api/init**: Inizializza l'indice Elasticsearch
- **POST /api/seed**: Genera prodotti fake con brand e categorie (usa Bogus)
- **GET /api/products/search**: Ricerca prodotti con filtri (query, brand, category)
- **GET /api/products/{id}**: Ottieni dettagli prodotto
- **GET /api/brands**: Ottieni tutti i brand
- **GET /api/categories**: Ottieni tutte le categorie

### Frontend (Next.js)

- Pagina principale con griglia prodotti
- Ricerca full-text
- Filtri per brand e categoria
- Paginazione
- Pagina dettaglio prodotto
- Design responsive con Tailwind CSS

## Requisiti

- Docker e Docker Compose
- .NET 10 SDK (per sviluppo locale)
- Node.js 20+ (per sviluppo locale)

## Avvio Rapido con Docker Compose

### Opzione 1: Script Automatico

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

Questo script:
- Avvia Elasticsearch e Kibana
- Attende che i servizi siano pronti
- Avvia l'API backend
- Inizializza l'indice
- Genera 100 prodotti di esempio

### Opzione 2: Manuale

1. Clona il repository:
```bash
git clone https://github.com/enricorticelli/elasticsearch-ecommerce-demo.git
cd elasticsearch-ecommerce-demo
```

2. Avvia tutti i servizi:
```bash
docker compose up -d
```

3. Attendi che tutti i servizi siano pronti (circa 1-2 minuti)

4. Inizializza l'indice Elasticsearch:
```bash
curl -X POST http://localhost:5000/api/init
```

5. Genera dati fake (esempio: 100 prodotti):
```bash
curl -X POST "http://localhost:5000/api/seed?count=100"
```

6. Accedi alle applicazioni:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Kibana**: http://localhost:5601
   - **Elasticsearch**: http://localhost:9200

## Sviluppo Locale

### Backend

```bash
cd src/EcommerceDemo.Api
dotnet run
```

L'API sarà disponibile su http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Il frontend sarà disponibile su http://localhost:3000

### Elasticsearch & Kibana

```bash
docker-compose up elasticsearch kibana
```

## Struttura del Progetto

```
.
├── docker-compose.yml           # Orchestrazione Docker
├── src/
│   ├── EcommerceDemo.Api/      # Backend .NET 10
│   │   ├── Program.cs          # Minimal APIs
│   │   ├── Models/
│   │   │   └── Product.cs      # Modello prodotto
│   │   └── Dockerfile
│   └── EcommerceDemo.ServiceDefaults/  # Configurazioni condivise
└── frontend/                    # Frontend Next.js
    ├── app/
    │   ├── page.tsx            # Pagina principale
    │   └── products/[id]/
    │       └── page.tsx        # Dettaglio prodotto
    ├── next.config.ts
    └── Dockerfile
```

## Tecnologie Utilizzate

### Backend
- **.NET 10**: Framework moderno ad alte prestazioni
- **Minimal APIs**: API leggere e performanti
- **Elastic.Clients.Elasticsearch**: Client ufficiale Elasticsearch
- **Bogus**: Generazione dati fake

### Frontend
- **Next.js 16**: Framework React con App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling utility-first
- **React Hooks**: Gestione stato

### Database & Search
- **Elasticsearch 8.11**: Motore di ricerca full-text distribuito
- **Kibana 8.11**: Visualizzazione e analytics

## API Examples

### Ricerca prodotti
```bash
# Ricerca per query
curl "http://localhost:5000/api/products/search?q=smartphone"

# Filtro per brand
curl "http://localhost:5000/api/products/search?brand=Apple"

# Filtro per categoria
curl "http://localhost:5000/api/products/search?category=Electronics"

# Combinazione filtri con paginazione
curl "http://localhost:5000/api/products/search?q=laptop&brand=Dell&page=1&pageSize=10"
```

### Dettaglio prodotto
```bash
curl "http://localhost:5000/api/products/{product-id}"
```

### Lista brand e categorie
```bash
curl "http://localhost:5000/api/brands"
curl "http://localhost:5000/api/categories"
```

## Configurazione

### Variabili d'Ambiente

#### Backend
- `ConnectionStrings__elasticsearch`: URL Elasticsearch (default: http://localhost:9200)
- `ASPNETCORE_ENVIRONMENT`: Ambiente (Development/Production)
- `ASPNETCORE_URLS`: URL di ascolto

#### Frontend
- `NEXT_PUBLIC_API_URL`: URL del backend API (default: http://localhost:5000)

## Produzione

Per il deployment in produzione:

1. Costruisci le immagini Docker:
```bash
docker-compose build
```

2. Avvia con le configurazioni di produzione:
```bash
docker-compose up -d
```

3. Configura le variabili d'ambiente appropriate per il tuo ambiente

## Troubleshooting

### Elasticsearch non si avvia
- Verifica la memoria disponibile (minimo 512MB)
- Controlla i log: `docker-compose logs elasticsearch`

### Frontend non si connette al backend
- Verifica che `NEXT_PUBLIC_API_URL` sia configurato correttamente
- Controlla che il backend sia in esecuzione: `curl http://localhost:5000/api/brands`

### Nessun prodotto visualizzato
- Assicurati di aver eseguito `/api/init` e `/api/seed`
- Verifica che l'indice Elasticsearch sia stato creato: `curl http://localhost:9200/products`

## Licenza

MIT

## Autore

Enrico Rticelli

