var builder = DistributedApplication.CreateBuilder(args);

// Add Elasticsearch with Kibana
var elasticsearch = builder.AddElasticsearch("elasticsearch")
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Persistent);

var kibana = elasticsearch.AddKibana("kibana")
    .WithLifetime(ContainerLifetime.Persistent);

// Add the API project
var api = builder.AddProject<Projects.EcommerceDemo_Api>("api")
    .WithReference(elasticsearch)
    .WaitFor(elasticsearch);

builder.Build().Run();
