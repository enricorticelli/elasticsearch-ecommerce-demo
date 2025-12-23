using EcommerceDemo.Api.Application.Models;
using EcommerceDemo.Api.Models;
using Elastic.Clients.Elasticsearch.QueryDsl;

namespace EcommerceDemo.Api.Infrastructure.Repositories;

public interface IProductRepository
{
    Task<bool> IndexExistsAsync(string indexName, CancellationToken cancellationToken = default);
    Task CreateIndexAsync(string indexName, CancellationToken cancellationToken = default);
    Task DeleteIndexAsync(string indexName, CancellationToken cancellationToken = default);
    Task BulkInsertAsync(string indexName, IEnumerable<Product> products, CancellationToken cancellationToken = default);
    Task<(long Total, IReadOnlyCollection<Product> Items, decimal? MinPrice, decimal? MaxPrice)> SearchAsync(
        string indexName,
        Query query,
        int from,
        int size,
        string? sort,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<AutocompleteHit>> AutocompleteAsync(string indexName, Query query, int size, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(string indexName, string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetBrandsAsync(string indexName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryGroup>> GetCategoriesAsync(string indexName, CancellationToken cancellationToken = default);
}
