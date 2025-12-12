using EcommerceDemo.Api.Models;
using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Aggregations;
using Elastic.Clients.Elasticsearch.QueryDsl;

namespace EcommerceDemo.Api.Infrastructure.Repositories;

public class ElasticProductRepository : IProductRepository
{
    private readonly ElasticsearchClient _client;

    public ElasticProductRepository(ElasticsearchClient client)
    {
        _client = client;
    }

    public async Task<bool> IndexExistsAsync(string indexName, CancellationToken cancellationToken = default)
    {
        var response = await _client.Indices.ExistsAsync(indexName, cancellationToken);
        return response.Exists;
    }

    public Task DeleteIndexAsync(string indexName, CancellationToken cancellationToken = default)
        => _client.Indices.DeleteAsync(indexName, cancellationToken);

    public Task CreateIndexAsync(string indexName, CancellationToken cancellationToken = default)
        => _client.Indices.CreateAsync(indexName, c => c
            .Mappings(m => m
                .Properties<Product>(p => p
                    .Keyword(k => k.Id)
                    .Text(t => t.Name)
                    .Text(t => t.Description)
                    .FloatNumber(n => n.Price)
                    .Keyword(k => k.Brand)
                    .Nested("categories", n => n
                        .Properties(cp => cp
                            .Keyword("name")
                            .IntegerNumber("level")
                        )
                    )
                    .IntegerNumber(n => n.Stock)
                    .Keyword(k => k.ImageUrl)
                    .Date(d => d.CreatedAt)
                )
            ),
            cancellationToken);

    public async Task BulkInsertAsync(string indexName, IEnumerable<Product> products, CancellationToken cancellationToken = default)
    {
        var response = await _client.BulkAsync(b => b
            .Index(indexName)
            .IndexMany(products),
            cancellationToken);

        if (!response.IsValidResponse)
        {
            throw new InvalidOperationException("Bulk insert failed");
        }

        await _client.Indices.RefreshAsync(indexName, cancellationToken);
    }

    public async Task<(long Total, IReadOnlyCollection<Product> Items)> SearchAsync(string indexName, Query query, int from, int size, CancellationToken cancellationToken = default)
    {
        var response = await _client.SearchAsync<Product>(s => s
            .Indices(indexName)
            .From(from)
            .Size(size)
            .Query(query)
            .Sort(sort => sort.Field(f => f.CreatedAt, descriptor => descriptor.Order(SortOrder.Desc))),
            cancellationToken);

        if (!response.IsValidResponse)
        {
            throw new InvalidOperationException($"Search failed: {response.ElasticsearchServerError?.Error?.Reason ?? "Unknown error"}");
        }

        return (response.Total, response.Documents);
    }

    public async Task<Product?> GetByIdAsync(string indexName, string id, CancellationToken cancellationToken = default)
    {
        var response = await _client.GetAsync<Product>(id, idx => idx.Index(indexName), cancellationToken);
        return response.Found ? response.Source : null;
    }

    public async Task<IReadOnlyList<string>> GetBrandsAsync(string indexName, CancellationToken cancellationToken = default)
    {
        var response = await _client.SearchAsync<Product>(s => s
            .Indices(indexName)
            .Size(0)
            .Aggregations(a => a
                .Add("brands", new Aggregation
                {
                    Terms = new TermsAggregation { Field = ProductFields.BrandKeyword, Size = 100 }
                })
            ),
            cancellationToken);

        if (!response.IsValidResponse || response.Aggregations is null)
        {
            return [];
        }

        var brandsAgg = response.Aggregations.GetStringTerms("brands");
        var brands = brandsAgg?.Buckets
            .Select(b => b.Key.Value?.ToString() ?? string.Empty)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(name => name)
            .ToList();

        return brands ?? [];
    }

    public async Task<IReadOnlyList<CategoryGroup>> GetCategoriesAsync(string indexName, CancellationToken cancellationToken = default)
    {
        var response = await _client.SearchAsync<Product>(s => s
            .Indices(indexName)
            .Size(0)
            .Aggregations(a => a
                .Add("categories_nested", agg => agg
                    .Nested(n => n.Path(ProductFields.Categories))
                    .Aggregations(nestedAgg => nestedAgg
                        .Add("levels", levelsAgg => levelsAgg
                            .Terms(t => t
                                .Field(ProductFields.CategoriesLevel)
                                .Size(10)
                            )
                            .Aggregations(levelAgg => levelAgg
                                .Add("names", namesAgg => namesAgg
                                    .Terms(t => t
                                        .Field(ProductFields.CategoriesNameKeyword)
                                        .Size(200)
                                    )
                                )
                            )
                        )
                    )
                )
            ),
            cancellationToken);

        if (!response.IsValidResponse || response.Aggregations is null)
        {
            return [];
        }

        var nestedAgg = response.Aggregations.GetNested("categories_nested");
        var levelAgg = nestedAgg?.Aggregations?.GetLongTerms("levels");

        if (levelAgg is null)
        {
            return [];
        }

        var result = levelAgg.Buckets
            .OrderBy(bucket => bucket.Key)
            .Select(bucket =>
            {
                var namesAgg = bucket.Aggregations?.GetStringTerms("names");
                var categoryNames = (namesAgg?.Buckets ?? [])
                    .Select(n => n.Key.Value?.ToString() ?? string.Empty)
                    .Where(name => !string.IsNullOrWhiteSpace(name))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(name => name)
                    .ToList();

                return new CategoryGroup((int)bucket.Key, categoryNames);
            })
            .Where(group => group.Categories.Count > 0)
            .ToList();

        return result;
    }
}
