using EcommerceDemo.Api.Application.Models;
using EcommerceDemo.Api.Models;

namespace EcommerceDemo.Api.Services;

public interface IProductService
{
    Task InitializeIndexAsync(CancellationToken cancellationToken = default);
    Task ResetIndexAsync(CancellationToken cancellationToken = default);
    Task SeedProductsAsync(int count, CancellationToken cancellationToken = default);
    Task<SearchResult<Product>> SearchProductsAsync(string? query, string? brand, string? category, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Product?> GetProductByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetBrandsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryGroup>> GetCategoriesAsync(CancellationToken cancellationToken = default);
}
