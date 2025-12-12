# Elasticsearch E-commerce Demo

Demo ricerca prodotti Ecommerce con .NET 10, Elasticsearch, Kibana e Next.js

## Architettura

Questa è un'applicazione e-commerce completa con:

- **Backend**: .NET 10 con Minimal APIs
- **Database**: Elasticsearch 8.11 per ricerca full-text
- **Visualizzazione**: Kibana per monitoraggio ed analytics
- **Frontend**: Next.js 16 con TypeScript e Tailwind CSS
- **Orchestrazione**: .NET Aspire (AppHost)

## Funzionalità

### Backend API (.NET 10)

- **POST /api/init**: Inizializza l'indice Elasticsearch
- **POST /api/seed**: Genera prodotti fake con brand e categorie (usa Bogus)
- **GET /api/products/search**: Ricerca prodotti con filtri (query, brand, category)
- **GET /api/products/{id}**: Ottieni dettagli prodotto
- **GET /api/brands**: Ottieni tutti i brand
- **GET /api/categories**: Ottieni tutte le categorie
- **Categorie multilivello**: ogni prodotto gestisce n nodi di categoria, ciascuno con un livello (es. livello 1 macro categoria, livello 2 sottoinsiemi, livello 3 sottosezioni)

### Frontend (Next.js)

- Pagina principale con griglia prodotti
- Ricerca full-text
- Filtri per brand e categoria
- Paginazione
- Pagina dettaglio prodotto
- Design responsive con Tailwind CSS

## Requisiti

- Docker Desktop (Aspire usa i container per Elasticsearch e Kibana)
- .NET 10 SDK (contiene anche .NET Aspire AppHost)
- Node.js 20+ / npm (per il frontend Next.js)

## Avvio Rapido con .NET Aspire

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

Gli script:
- verificano la presenza di .NET SDK, Docker e Node.js
- installano automaticamente le dipendenze del frontend (solo al primo avvio)
- avviano l'AppHost Aspire (`dotnet run src/EcommerceDemo.AppHost`)
- attendono che Elasticsearch + API siano pronti
- inizializzano l'indice e generano 100 prodotti di esempio

Al termine trovi tutto pronto su:
- **Frontend** http://localhost:3000
- **Backend** http://localhost:5000
- **Kibana** http://localhost:5601
- **Elasticsearch** http://localhost:9200

### Opzione 2: Manuale

1. Clona il repository:
    ```bash
    git clone https://github.com/enricorticelli/elasticsearch-ecommerce-demo.git
    cd elasticsearch-ecommerce-demo
    ```
2. Installa le dipendenze del frontend:
    ```bash
    cd frontend
    npm install
    cd ..
    ```
3. Avvia tutti i servizi tramite .NET Aspire:
    ```bash
    dotnet run --project src/EcommerceDemo.AppHost/EcommerceDemo.AppHost.csproj
    ```
   L'AppHost orchestra Elasticsearch, Kibana, backend API e frontend.
4. In un secondo terminale inizializza l'indice e genera i dati:
    ```bash
    curl -X POST http://localhost:5000/api/init
    curl -X POST "http://localhost:5000/api/seed?count=100"
    ```
   > L'endpoint `/api/init` ricrea l'indice `products` per assicurare il mapping aggiornato delle categorie multilivello.
5. Accedi a frontend, backend e Kibana tramite gli URL indicati nei log di Aspire.

## Sviluppo Locale

### Tutti i servizi (consigliato)

```bash
dotnet run --project src/EcommerceDemo.AppHost/EcommerceDemo.AppHost.csproj
```

L'AppHost avvia e mantiene sincronizzati frontend, backend, Elasticsearch e Kibana.

### Solo backend

```bash
cd src/EcommerceDemo.Api
dotnet run --urls http://localhost:5000
```

Assicurati che Elasticsearch sia disponibile (puoi lasciar girare l'AppHost in parallelo).

### Solo frontend

```bash
cd frontend
npm install
npm run dev
```

Il frontend userà `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`). Ricordati di avviare comunque l'API tramite AppHost o `dotnet run`.

## Struttura del Progetto

```
.
├── docker-compose.yml           # Config legacy (opzionale)
├── src/
│   ├── EcommerceDemo.AppHost/  # Orchestratore .NET Aspire
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

`/api/categories` restituisce oggetti del tipo:

```json
[
  { "level": 1, "categories": ["Electronics", "Home & Living"] },
  { "level": 2, "categories": ["Computers", "Streaming", "Decor"] },
  { "level": 3, "categories": ["Laptops", "VR", "Cookware"] }
]
```

In questo modo il frontend può popolare filtri o breadcrumb basati sul livello della categoria.

## Configurazione

### Variabili d'Ambiente

#### Backend
- `ConnectionStrings__elasticsearch`: URL Elasticsearch (default: http://localhost:9200)
- `ASPNETCORE_ENVIRONMENT`: Ambiente (Development/Production)
- `ASPNETCORE_URLS`: URL di ascolto

#### Frontend
- `NEXT_PUBLIC_API_URL`: URL del backend API (default: http://localhost:5000)

## Produzione

.NET Aspire è pensato per lo sviluppo locale. Per la produzione puoi:

1. Costruire le immagini Docker (ad esempio con `docker build` o `docker compose build`)
2. Distribuire le immagini con l'orchestratore che preferisci (Docker Compose, Kubernetes, Azure Container Apps, ecc.)
3. Configurare le variabili d'ambiente (`ConnectionStrings__elasticsearch`, `NEXT_PUBLIC_API_URL`, ecc.) in base all'infrastruttura

## Troubleshooting

### Elasticsearch non si avvia
- Verifica la memoria disponibile (minimo 512MB)
- Controlla i log dell'AppHost (.aspire.log su Linux/Mac o finestra "Aspire AppHost" su Windows)

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

