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
            int page = 1,
            int pageSize = 20,
            CancellationToken cancellationToken = default) =>
        {
            var result = await service.SearchProductsAsync(q, brand, category, page, pageSize, cancellationToken);
            return Results.Ok(new
            {
                total = result.Total,
                result.Page,
                result.PageSize,
                products = result.Items
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
