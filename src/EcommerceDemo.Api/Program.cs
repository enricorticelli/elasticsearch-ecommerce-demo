using EcommerceDemo.Api.Endpoints;
using EcommerceDemo.Api.Extensions;
using EcommerceDemo.Api.Services;
using EcommerceDemo.ServiceDefaults;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddOpenApi();

var app = builder.Build();

// Initialize the Elasticsearch index on startup if it doesn't exist
using (var scope = app.Services.CreateScope())
{
    var productService = scope.ServiceProvider.GetRequiredService<IProductService>();
    try
    {
        await productService.InitializeIndexAsync();
        app.Logger.LogInformation("Elasticsearch index initialized successfully");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Failed to initialize Elasticsearch index on startup. Make sure Elasticsearch is running.");
    }
}

app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors();

app.MapSetupEndpoints();
app.MapProductEndpoints();
app.MapMetadataEndpoints();

await app.RunAsync();
