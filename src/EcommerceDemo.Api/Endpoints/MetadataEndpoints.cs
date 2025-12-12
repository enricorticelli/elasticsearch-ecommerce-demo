using EcommerceDemo.Api.Services;

namespace EcommerceDemo.Api.Endpoints;

public static class MetadataEndpoints
{
    public static IEndpointRouteBuilder MapMetadataEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api");

        group.MapGet("/brands", async (IProductService service, CancellationToken cancellationToken = default) =>
        {
            var brands = await service.GetBrandsAsync(cancellationToken);
            return Results.Ok(brands);
        });

        group.MapGet("/categories", async (IProductService service, CancellationToken cancellationToken = default) =>
        {
            var categories = await service.GetCategoriesAsync(cancellationToken);
            return Results.Ok(categories);
        });

        return endpoints;
    }
}
