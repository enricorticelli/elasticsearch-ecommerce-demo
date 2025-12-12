using EcommerceDemo.Api.Models;
using Elastic.Clients.Elasticsearch.QueryDsl;

namespace EcommerceDemo.Api.Infrastructure.Repositories;

public interface IProductRepository
{
    Task<bool> IndexExistsAsync(string indexName, CancellationToken cancellationToken = default);
    Task CreateIndexAsync(string indexName, CancellationToken cancellationToken = default);
    Task DeleteIndexAsync(string indexName, CancellationToken cancellationToken = default);
    Task BulkInsertAsync(string indexName, IEnumerable<Product> products, CancellationToken cancellationToken = default);
    Task<(long Total, IReadOnlyCollection<Product> Items)> SearchAsync(string indexName, Query query, int from, int size, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(string indexName, string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetBrandsAsync(string indexName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryGroup>> GetCategoriesAsync(string indexName, CancellationToken cancellationToken = default);
}
