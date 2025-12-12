# Elasticsearch E-commerce Demo

Demo full-stack per la ricerca prodotti che combina Minimal APIs .NET 10, Elasticsearch 8.11, Kibana e frontend Next.js 16 orchestrati tramite .NET Aspire. I vecchi script `start.sh` / `start.bat` e il `docker-compose` legacy sono stati rimossi: ora l'AppHost Aspire è l'unico punto di ingresso per l'intero ambiente.

## Stack
- **Backend**: Minimal APIs .NET 10 + Elastic.Clients.Elasticsearch + Bogus per il seeding
- **Ricerca**: Elasticsearch 8.11 (single-node, X-Pack security disabilitato)
- **Osservabilità**: Kibana 8.11
- **Frontend**: Next.js 16 (App Router, Tailwind CSS)
- **Orchestrazione**: .NET Aspire (AppHost + ServiceDefaults con health checks, resilienza, ecc.)

## Prerequisiti
1. **.NET 8/10 SDK** con i workload Aspire (installabili via `dotnet workload install aspire`)
2. **Docker Desktop** o un runtime compatibile: Aspire avvia i container Elasticsearch e Kibana
3. **Node.js 20+** (npm è usato automaticamente dall'AppHost quando esegue `npm run dev`)
4. **curl** (facoltativo ma utile per inizializzare e popolare Elasticsearch)

## Avvio rapido con Aspire
1. Ripristina le dipendenze (solo se non è stato ancora fatto):
   ```bash
   dotnet restore
   ```
2. Avvia tutto l'ambiente con l'AppHost:
   ```bash
   dotnet run --project src/EcommerceDemo.AppHost/EcommerceDemo.AppHost.csproj
   ```
   L'AppHost esegue queste attività:
   - Crea i container `aspire-ecommerce-demo-elasticsearch` (dati persistenti) e `aspire-ecommerce-demo-kibana`
   - Pubblica la Minimal API .NET e il frontend Next.js sulla rete Aspire
   - Lancia `npm install` + `npm run dev` per il frontend quando necessario
   - Espone una dashboard Aspire con tutti gli endpoint e gli health check

3. Attendi che Elasticsearch e l'API risultino `Healthy` nella dashboard Aspire (la prima esecuzione può richiedere ~1 minuto per via dell'installazione npm).

## Inizializzazione dei dati
Elasticsearch parte vuoto. Una volta che l'API è disponibile, apri un terminale e lancia:
```bash
curl -X POST http://localhost:5000/api/init
curl -X POST "http://localhost:5000/api/seed?count=100"
```
`/api/init` ricrea l'indice `products` con il mapping aggiornato per le categorie multilivello; `/api/seed` genera prodotti fittizi (50 di default se `count` non è specificato).

## Servizi esposti
- Frontend Next.js: http://localhost:3000
- API .NET: http://localhost:5000
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

(Gli URL possono cambiare se modifichi le porte nell'AppHost. Controlla sempre la dashboard Aspire o i log.)

## API principali
`/api/products/search`  
Parametri opzionali: `q`, `brand`, `category`, `page`, `pageSize`. Restituisce `total`, pagina corrente e lista prodotti.

`/api/products/{id}`  
Dettaglio singolo prodotto, 404 se non trovato.

`/api/brands` e `/api/categories`  
Supportano il frontend per popolare i filtri brand e categorie a più livelli.

`/api/init` e `/api/seed`  
Endpoint di setup per ricreare l'indice e popolare Elasticsearch.

## Sviluppo mirato
Vuoi lavorare su un servizio alla volta?

- **Solo API**  
  ```bash
  cd src/EcommerceDemo.Api
  dotnet run --urls http://localhost:5000
  ```
  Assicurati di avere Elasticsearch già attivo (puoi lasciar girare l'AppHost per i container).

- **Solo frontend**  
  ```bash
  cd src/frontend
  npm install
  npm run dev
  ```
  Configura l'API via `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`).

## Configurazione
### Backend
- `ConnectionStrings__elasticsearch`: URL dell'istanza Elasticsearch (di default `http://localhost:9200`)
- `ASPNETCORE_ENVIRONMENT`, `ASPNETCORE_URLS`: classiche variabili ASP.NET

### Frontend
- `NEXT_PUBLIC_API_URL`: URL base dell'API
- `PORT`: impostato dall'AppHost a `3000`

Le override possono essere definite in `src/EcommerceDemo.AppHost/appsettings*.json` o via variabili d'ambiente Aspire.

## Struttura del repository
```
.
├── src/
│   ├── EcommerceDemo.AppHost/        # AppHost Aspire: definisce container + progetti
│   ├── EcommerceDemo.Api/            # Minimal APIs, endpoint prodotti/metadata/setup
│   ├── EcommerceDemo.ServiceDefaults # Config condivise (health, resilience, logging)
│   └── ...
├── src/frontend/                     # Next.js 16 con App Router
└── EcommerceDemo.sln
```

## Troubleshooting rapido
- **Elasticsearch non parte**: controlla che Docker abbia almeno 2GB di RAM disponibili e riavvia l'AppHost (il container usa `ES_JAVA_OPTS=-Xms512m -Xmx512m`).
- **Il frontend non mostra prodotti**: verifica di aver chiamato `/api/init` e `/api/seed` e di avere `NEXT_PUBLIC_API_URL` puntato alla tua API.
- **Aspire segnala `Unhealthy`**: apri i log del relativo componente dalla dashboard Aspire per capire se mancano dipendenze o variabili d'ambiente.

## Licenza
MIT

## Autore
Enrico Rticelli
