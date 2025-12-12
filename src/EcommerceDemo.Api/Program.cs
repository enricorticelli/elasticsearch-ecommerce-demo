using Bogus;
using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Mapping;
using Elastic.Clients.Elasticsearch.QueryDsl;
using Elastic.Clients.Elasticsearch.Aggregations;
using EcommerceDemo.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Elasticsearch client
var elasticsearchUri = builder.Configuration.GetConnectionString("elasticsearch") ?? "http://localhost:9200";
var settings = new ElasticsearchClientSettings(new Uri(elasticsearchUri))
    .DisableDirectStreaming();
builder.Services.AddSingleton(new ElasticsearchClient(settings));

var app = builder.Build();

app.UseCors();

// Initialize Elasticsearch index
app.MapPost("/api/init", async (ElasticsearchClient client) =>
{
    const string indexName = "products";
    
    // Check if index exists
    var existsResponse = await client.Indices.ExistsAsync(indexName);
    
    if (!existsResponse.Exists)
    {
        // Create index with mapping
        await client.Indices.CreateAsync(indexName, c => c
            .Mappings(m => m
                .Properties<Product>(p => p
                    .Keyword(k => k.Id)
                    .Text(t => t.Name)
                    .Text(t => t.Description)
                    .FloatNumber(n => n.Price)
                    .Keyword(k => k.Brand)
                    .Keyword(k => k.Category)
                    .IntegerNumber(n => n.Stock)
                    .Keyword(k => k.ImageUrl)
                    .Date(d => d.CreatedAt)
                )
            )
        );
    }
    
    return Results.Ok(new { message = "Index initialized successfully" });
});

// Seed fake products
app.MapPost("/api/seed", async (ElasticsearchClient client, int count = 50) =>
{
    const string indexName = "products";
    
    var brands = new[] { "Apple", "Samsung", "Sony", "LG", "Microsoft", "Dell", "HP", "Lenovo", "Asus", "Acer" };
    var categories = new[] { "Electronics", "Computers", "Smartphones", "Tablets", "Accessories", "Gaming", "Audio", "Wearables" };
    
    var faker = new Faker<Product>()
        .RuleFor(p => p.Id, f => Guid.NewGuid().ToString())
        .RuleFor(p => p.Name, f => f.Commerce.ProductName())
        .RuleFor(p => p.Description, f => f.Commerce.ProductDescription())
        .RuleFor(p => p.Price, f => decimal.Parse(f.Commerce.Price(10, 2000)))
        .RuleFor(p => p.Brand, f => f.PickRandom(brands))
        .RuleFor(p => p.Category, f => f.PickRandom(categories))
        .RuleFor(p => p.Stock, f => f.Random.Int(0, 100))
        .RuleFor(p => p.ImageUrl, f => f.Image.PicsumUrl())
        .RuleFor(p => p.CreatedAt, f => f.Date.Past(1));
    
    var products = faker.Generate(count);
    
    var bulkResponse = await client.BulkAsync(b => b
        .Index(indexName)
        .IndexMany(products)
    );
    
    if (bulkResponse.IsValidResponse)
    {
        // Refresh the index to make documents searchable immediately
        await client.Indices.RefreshAsync(indexName);
        return Results.Ok(new { message = $"Successfully seeded {count} products", count });
    }
    
    return Results.Problem("Failed to seed products");
});

// Search products
app.MapGet("/api/products/search", async (ElasticsearchClient client, string? q = null, string? brand = null, string? category = null, int page = 1, int pageSize = 20) =>
{
    const string indexName = "products";
    
    var from = (page - 1) * pageSize;
    
    try
    {
        // Build query outside the fluent API
        Query buildQuery()
        {
            var mustQueries = new List<Query>();
            
            if (!string.IsNullOrWhiteSpace(q))
            {
                mustQueries.Add(new MultiMatchQuery
                {
                    Query = q,
                    Fields = new Elastic.Clients.Elasticsearch.Field[] { "name", "description", "brand", "category" }
                });
            }
            
            if (!string.IsNullOrWhiteSpace(brand))
            {
                mustQueries.Add(new TermQuery { Field = "brand.keyword", Value = brand });
            }
            
            if (!string.IsNullOrWhiteSpace(category))
            {
                mustQueries.Add(new TermQuery { Field = "category.keyword", Value = category });
            }
            
            if (mustQueries.Count == 0)
            {
                return new MatchAllQuery();
            }
            
            return new BoolQuery { Must = mustQueries };
        }
        
        var searchResponse = await client.SearchAsync<Product>(s => s
            .Indices(indexName)
            .From(from)
            .Size(pageSize)
            .Query(buildQuery())
            .Sort(sort => sort.Field(f => f.CreatedAt, descriptor => descriptor.Order(SortOrder.Desc)))
        );
        
        if (searchResponse.IsValidResponse)
        {
            return Results.Ok(new
            {
                total = searchResponse.Total,
                page,
                pageSize,
                products = searchResponse.Documents
            });
        }
        
        return Results.Problem($"Search failed: {searchResponse.ElasticsearchServerError?.Error?.Reason ?? "Unknown error"}");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Search exception: {ex.Message}");
    }
});

// Get product by ID
app.MapGet("/api/products/{id}", async (ElasticsearchClient client, string id) =>
{
    const string indexName = "products";
    
    var response = await client.GetAsync<Product>(id, idx => idx.Index(indexName));
    
    if (response.IsValidResponse && response.Found)
    {
        return Results.Ok(response.Source);
    }
    
    return Results.NotFound(new { message = "Product not found" });
});

// Get all brands
app.MapGet("/api/brands", async (ElasticsearchClient client) =>
{
    const string indexName = "products";
    
    var response = await client.SearchAsync<Product>(s => s
        .Indices(indexName)
        .Size(0)
        .Aggregations(a => a
            .Add("brands", new Aggregation
            {
                Terms = new TermsAggregation { Field = "brand.keyword", Size = 100 }
            })
        )
    );
    
    if (response.IsValidResponse && response.Aggregations != null)
    {
        var brandsAgg = response.Aggregations.GetStringTerms("brands");
        var brands = brandsAgg?.Buckets.Select(b => b.Key.Value?.ToString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList() ?? new List<string>();
        return Results.Ok(brands);
    }
    
    return Results.Ok(new List<string>());
});

// Get all categories
app.MapGet("/api/categories", async (ElasticsearchClient client) =>
{
    const string indexName = "products";
    
    var response = await client.SearchAsync<Product>(s => s
        .Indices(indexName)
        .Size(0)
        .Aggregations(a => a
            .Add("categories", new Aggregation
            {
                Terms = new TermsAggregation { Field = "category.keyword", Size = 100 }
            })
        )
    );
    
    if (response.IsValidResponse && response.Aggregations != null)
    {
        var categoriesAgg = response.Aggregations.GetStringTerms("categories");
        var categories = categoriesAgg?.Buckets.Select(b => b.Key.Value?.ToString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList() ?? new List<string>();
        return Results.Ok(categories);
    }
    
    return Results.Ok(new List<string>());
});

app.Run();
