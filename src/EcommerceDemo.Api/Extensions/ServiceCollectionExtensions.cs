using EcommerceDemo.Api.Infrastructure.Repositories;
using EcommerceDemo.Api.Services;
using Elastic.Clients.Elasticsearch;
using Microsoft.Extensions.DependencyInjection;

namespace EcommerceDemo.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        var elasticsearchUri = configuration.GetConnectionString("elasticsearch") ?? "http://localhost:9200";
        var settings = new ElasticsearchClientSettings(new Uri(elasticsearchUri))
            .DisableDirectStreaming();

        services.AddSingleton(new ElasticsearchClient(settings));

        services.AddScoped<IProductRepository, ElasticProductRepository>();
        services.AddScoped<IProductService, ProductService>();

        return services;
    }
}
