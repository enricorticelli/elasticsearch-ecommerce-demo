using EcommerceDemo.Api.Services;

namespace EcommerceDemo.Api.Endpoints;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/products");

        group.MapGet("/search", async (
            IProductService service,
            string? q,
            string? brand,
            string? category,
            decimal? minPrice,
            decimal? maxPrice,
            string? sort,
            int page = 1,
            int pageSize = 20,
            CancellationToken cancellationToken = default) =>
        {
            var result = await service.SearchProductsAsync(q, brand, category, minPrice, maxPrice, sort, page, pageSize, cancellationToken);
            return Results.Ok(new
            {
                total = result.Total,
                result.Page,
                result.PageSize,
                minPrice = result.MinPrice,
                maxPrice = result.MaxPrice,
                products = result.Items
            });
        });

        group.MapGet("/autocomplete", async (
            IProductService service,
            string? q,
            int size = 6,
            CancellationToken cancellationToken = default) =>
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return Results.Ok(new { products = Array.Empty<object>() });
            }

            var products = await service.AutocompleteProductsAsync(q, Math.Clamp(size, 1, 12), cancellationToken);
            return Results.Ok(new
            {
                products = products.Select(hit => new
                {
                    hit.Product.Id,
                    hit.Product.Name,
                    hit.Product.Brand,
                    hit.Product.Price,
                    hit.Product.ImageUrl,
                    hit.Product.Categories,
                    suggestionHtml = hit.Highlight
                })
            });
        });

        group.MapGet("/{id}", async (IProductService service, string id, CancellationToken cancellationToken = default) =>
        {
            var product = await service.GetProductByIdAsync(id, cancellationToken);
            return product is not null ? Results.Ok(product) : Results.NotFound(new { message = "Product not found" });
        });

        return endpoints;
    }
}
