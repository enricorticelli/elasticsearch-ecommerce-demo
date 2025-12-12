using Bogus;
using EcommerceDemo.Api.Application.Models;
using EcommerceDemo.Api.Infrastructure;
using EcommerceDemo.Api.Infrastructure.Repositories;
using EcommerceDemo.Api.Models;
using Elastic.Clients.Elasticsearch.QueryDsl;

namespace EcommerceDemo.Api.Services;

public class ProductService : IProductService
{
    private const string IndexName = "products";

    private readonly IProductRepository _repository;
    private readonly Faker<Product> _productFaker;
    private readonly string[] _level1Categories;
    private readonly Dictionary<string, string[]> _level2ByLevel1;
    private readonly Dictionary<string, string[]> _level3ByLevel2;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;

        _level1Categories = ["Electronics", "Home & Living", "Gaming & Entertainment"];
        _level2ByLevel1 = new Dictionary<string, string[]>
        {
            ["Electronics"] = ["Computers", "Smartphones", "Audio", "Cameras"],
            ["Home & Living"] = ["Appliances", "Furniture", "Decor", "Kitchen"],
            ["Gaming & Entertainment"] = ["Consoles", "PC Gaming", "Board Games", "Streaming"]
        };
        _level3ByLevel2 = new Dictionary<string, string[]>
        {
            ["Computers"] = ["Laptops", "Desktops", "Monitors", "Components", "Storage"],
            ["Smartphones"] = ["Android Phones", "iOS Phones", "Accessories", "Wearables"],
            ["Audio"] = ["Headphones", "Speakers", "Soundbars", "Microphones"],
            ["Cameras"] = ["DSLR", "Mirrorless", "Action Cams", "Lenses"],
            ["Appliances"] = ["Refrigerators", "Washers", "Dryers", "Air Purifiers"],
            ["Furniture"] = ["Desks", "Chairs", "Shelves", "Lighting"],
            ["Decor"] = ["Wall Art", "Clocks", "Plants", "Mirrors"],
            ["Kitchen"] = ["Cookware", "Coffee Makers", "Blenders", "Utensils"],
            ["Consoles"] = ["PlayStation", "Xbox", "Nintendo", "Retro"],
            ["PC Gaming"] = ["Graphics Cards", "Keyboards", "Mice", "VR"],
            ["Board Games"] = ["Strategy", "Party", "Card Games", "Co-op"],
            ["Streaming"] = ["Microphones", "Webcams", "Capture Cards", "Lighting Kits"]
        };

        var brands = new[] { "Apple", "Samsung", "Sony", "LG", "Microsoft", "Dell", "HP", "Lenovo", "Asus", "Acer" };

        _productFaker = new Faker<Product>()
            .RuleFor(p => p.Id, f => Guid.NewGuid().ToString())
            .RuleFor(p => p.Name, f => f.Commerce.ProductName())
            .RuleFor(p => p.Description, f => f.Commerce.ProductDescription())
            .RuleFor(p => p.Price, f => decimal.Parse(f.Commerce.Price(10, 2000)))
            .RuleFor(p => p.Brand, f => f.PickRandom(brands))
            .RuleFor(p => p.Categories, BuildCategories)
            .RuleFor(p => p.Stock, f => f.Random.Int(0, 100))
            .RuleFor(p => p.ImageUrl, f => f.Image.PicsumUrl())
            .RuleFor(p => p.CreatedAt, f => f.Date.Past(1));
    }

    public async Task InitializeIndexAsync(CancellationToken cancellationToken = default)
    {
        if (await _repository.IndexExistsAsync(IndexName, cancellationToken))
        {
            await _repository.DeleteIndexAsync(IndexName, cancellationToken);
        }

        await _repository.CreateIndexAsync(IndexName, cancellationToken);
    }

    public async Task SeedProductsAsync(int count, CancellationToken cancellationToken = default)
    {
        var products = _productFaker.Generate(count);
        await _repository.BulkInsertAsync(IndexName, products, cancellationToken);
    }

    public async Task<SearchResult<Product>> SearchProductsAsync(string? query, string? brand, string? category, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var from = (page - 1) * pageSize;
        var builtQuery = BuildSearchQuery(query, brand, category);

        var (total, items) = await _repository.SearchAsync(IndexName, builtQuery, from, pageSize, cancellationToken);
        return new SearchResult<Product>(total, page, pageSize, items);
    }

    public Task<Product?> GetProductByIdAsync(string id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(IndexName, id, cancellationToken);

    public Task<IReadOnlyList<string>> GetBrandsAsync(CancellationToken cancellationToken = default)
        => _repository.GetBrandsAsync(IndexName, cancellationToken);

    public Task<IReadOnlyList<CategoryGroup>> GetCategoriesAsync(CancellationToken cancellationToken = default)
        => _repository.GetCategoriesAsync(IndexName, cancellationToken);

    private static Query BuildSearchQuery(string? query, string? brand, string? category)
    {
        var mustQueries = new List<Query>();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var shouldQueries = new List<Query>
            {
                new MultiMatchQuery
                {
                    Query = query,
                    Fields = new Elastic.Clients.Elasticsearch.Field[]
                    {
                        ProductFields.Name,
                        ProductFields.Description,
                        ProductFields.Brand
                    }
                }
            };

            shouldQueries.Add(new NestedQuery
            {
                Path = ProductFields.Categories,
                Query = new MatchQuery { Field = ProductFields.CategoriesName, Query = query }
            });

            mustQueries.Add(new BoolQuery
            {
                Should = shouldQueries,
                MinimumShouldMatch = 1
            });
        }

        if (!string.IsNullOrWhiteSpace(brand))
        {
            mustQueries.Add(new TermQuery { Field = ProductFields.BrandKeyword, Value = brand });
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            mustQueries.Add(new NestedQuery
            {
                Path = ProductFields.Categories,
                Query = new TermQuery { Field = ProductFields.CategoriesNameKeyword, Value = category }
            });
        }

        if (mustQueries.Count == 0)
        {
            return new MatchAllQuery();
        }

        return new BoolQuery { Must = mustQueries };
    }

    private List<CategoryNode> BuildCategories(Faker faker)
    {
        var nodes = new List<CategoryNode>();
        var level1 = faker.PickRandom(_level1Categories);
        nodes.Add(new CategoryNode { Level = 1, Name = level1 });

        if (!_level2ByLevel1.TryGetValue(level1, out var level2Options) || level2Options.Length <= 0) return nodes;
        
        var level2Count = faker.Random.Int(1, Math.Min(2, level2Options.Length));
        var selectedLevel2 = faker.Random.Shuffle(level2Options).Take(level2Count);

        foreach (var level2 in selectedLevel2)
        {
            nodes.Add(new CategoryNode { Level = 2, Name = level2 });

            if (!_level3ByLevel2.TryGetValue(level2, out var level3Options) || level3Options.Length <= 0) continue;
                
            var level3Count = faker.Random.Int(1, Math.Min(5, level3Options.Length));
            var selectedLevel3 = faker.Random.Shuffle(level3Options).Take(level3Count);

            nodes.AddRange(selectedLevel3.Select(level3 => new CategoryNode { Level = 3, Name = level3 }));
        }

        return nodes;
    }
}
