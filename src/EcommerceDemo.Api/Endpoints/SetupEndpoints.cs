using EcommerceDemo.Api.Services;

namespace EcommerceDemo.Api.Endpoints;

public static class SetupEndpoints
{
    public static IEndpointRouteBuilder MapSetupEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api");

        group.MapPost("/init", async (IProductService service, CancellationToken cancellationToken = default) =>
        {
            await service.InitializeIndexAsync(cancellationToken);
            return Results.Ok(new { message = "Index initialized successfully" });
        });

        group.MapPost("/seed", async (IProductService service, int count = 50, CancellationToken cancellationToken = default) =>
        {
            await service.SeedProductsAsync(count, cancellationToken);
            return Results.Ok(new { message = $"Successfully seeded {count} products", count });
        });

        return endpoints;
    }
}
