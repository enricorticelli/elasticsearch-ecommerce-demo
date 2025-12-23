using System.Collections.Generic;
using EcommerceDemo.Api.Application.Models;
using EcommerceDemo.Api.Models;
using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Aggregations;
using Elastic.Clients.Elasticsearch.QueryDsl;

namespace EcommerceDemo.Api.Infrastructure.Repositories;

public class ElasticProductRepository(ElasticsearchClient client) : IProductRepository
{
    public async Task<bool> IndexExistsAsync(string indexName, CancellationToken cancellationToken = default)
    {
        var response = await client.Indices.ExistsAsync(indexName, cancellationToken);
        return response.Exists;
    }

    public Task DeleteIndexAsync(string indexName, CancellationToken cancellationToken = default)
        => client.Indices.DeleteAsync(indexName, cancellationToken);

    public Task CreateIndexAsync(string indexName, CancellationToken cancellationToken = default)
        => client.Indices.CreateAsync(indexName, c => c
            .Mappings(m => m
                .Properties<Product>(p => p
                    .Keyword(k => k.Id)
                    .SearchAsYouType(s => s.Name, s => s
                        .Fields(f => f.Keyword("keyword")))
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
        const int batchSize = 1000;
        var batch = new List<Product>(batchSize);

        foreach (var product in products)
        {
            batch.Add(product);
            if (batch.Count < batchSize)
            {
                continue;
            }

            await BulkInsertBatchAsync(indexName, batch, cancellationToken);
            batch.Clear();
        }

        if (batch.Count > 0)
        {
            await BulkInsertBatchAsync(indexName, batch, cancellationToken);
        }

        await client.Indices.RefreshAsync(indexName, cancellationToken);
    }

    private async Task BulkInsertBatchAsync(string indexName, IReadOnlyCollection<Product> batch, CancellationToken cancellationToken)
    {
        var response = await client.BulkAsync(b => b
                .Index(indexName)
                .IndexMany(batch),
            cancellationToken);

        if (!response.IsValidResponse || response.Errors)
        {
            throw new InvalidOperationException($"Bulk insert failed: {response.ElasticsearchServerError?.Error?.Reason ?? "Unknown error"}");
        }
    }

    public async Task<(long Total, IReadOnlyCollection<Product> Items, decimal? MinPrice, decimal? MaxPrice)> SearchAsync(
        string indexName,
        Query query,
        int from,
        int size,
        string? sort,
        CancellationToken cancellationToken = default)
    {
        var response = await client.SearchAsync<Product>(s =>
        {
            s.Indices(indexName)
                .From(from)
                .Size(size)
                .Query(query)
                .TrackTotalHits(true)
                .Aggregations(a => a
                    .Add("min_price", new Aggregation
                    {
                        Min = new MinAggregation { Field = ProductFields.Price }
                    })
                    .Add("max_price", new Aggregation
                    {
                        Max = new MaxAggregation { Field = ProductFields.Price }
                    }));

            if (!string.IsNullOrWhiteSpace(sort) && !sort.Equals("relevance", StringComparison.OrdinalIgnoreCase))
            {
                switch (sort.ToLowerInvariant())
                {
                    case "title":
                        s.Sort(sortDescriptor => sortDescriptor
                            .Field(ProductFields.NameKeyword, descriptor => descriptor.Order(SortOrder.Asc)));
                        break;
                    case "price_asc":
                        s.Sort(sortDescriptor => sortDescriptor
                            .Field(ProductFields.Price, descriptor => descriptor.Order(SortOrder.Asc)));
                        break;
                    case "price_desc":
                        s.Sort(sortDescriptor => sortDescriptor
                            .Field(ProductFields.Price, descriptor => descriptor.Order(SortOrder.Desc)));
                        break;
                }
            }
        }, cancellationToken);

        if (!response.IsValidResponse)
        {
            throw new InvalidOperationException($"Search failed: {response.ElasticsearchServerError?.Error?.Reason ?? "Unknown error"}");
        }

        var minAgg = response.Aggregations?.GetMin("min_price");
        var maxAgg = response.Aggregations?.GetMax("max_price");

        var minPrice = minAgg?.Value.HasValue == true ? (decimal?)minAgg.Value.Value : null;
        var maxPrice = maxAgg?.Value.HasValue == true ? (decimal?)maxAgg.Value.Value : null;

        return (response.Total, response.Documents, minPrice, maxPrice);
    }

    public async Task<IReadOnlyCollection<AutocompleteHit>> AutocompleteAsync(
        string indexName,
        Query query,
        int size,
        CancellationToken cancellationToken = default)
    {
        var highlight = new Elastic.Clients.Elasticsearch.Core.Search.Highlight(
            new Dictionary<Field, Elastic.Clients.Elasticsearch.Core.Search.HighlightField>
            {
                { ProductFields.Name, new Elastic.Clients.Elasticsearch.Core.Search.HighlightField() },
                { ProductFields.Brand, new Elastic.Clients.Elasticsearch.Core.Search.HighlightField() }
            })
        {
            RequireFieldMatch = false
        };

        var response = await client.SearchAsync<Product>(s => s
            .Indices(indexName)
            .Size(size)
            .Query(query)
            .Highlight(highlight),
            cancellationToken);

        if (!response.IsValidResponse)
        {
            throw new InvalidOperationException($"Autocomplete failed: {response.ElasticsearchServerError?.Error?.Reason ?? "Unknown error"}");
        }

        return response.Hits
            .Select(hit =>
            {
                var highlight = ExtractHighlight(hit.Highlight);
                return hit.Source is null ? null : new AutocompleteHit(hit.Source, highlight);
            })
            .Where(hit => hit is not null)
            .Cast<AutocompleteHit>()
            .ToList();
    }

    private static string? ExtractHighlight(IReadOnlyDictionary<string, IReadOnlyCollection<string>>? highlight)
    {
        if (highlight is null)
        {
            return null;
        }

        if (highlight.TryGetValue(ProductFields.Name, out var nameHighlights))
        {
            return nameHighlights.FirstOrDefault();
        }

        if (highlight.TryGetValue(ProductFields.Brand, out var brandHighlights))
        {
            return brandHighlights.FirstOrDefault();
        }

        return null;
    }

    public async Task<Product?> GetByIdAsync(string indexName, string id, CancellationToken cancellationToken = default)
    {
        var response = await client.GetAsync<Product>(id, idx => idx.Index(indexName), cancellationToken);
        return response.Found ? response.Source : null;
    }

    public async Task<IReadOnlyList<string>> GetBrandsAsync(string indexName, CancellationToken cancellationToken = default)
    {
        var response = await client.SearchAsync<Product>(s => s
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
        var response = await client.SearchAsync<Product>(s => s
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
