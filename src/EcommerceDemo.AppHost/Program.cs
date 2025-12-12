using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var elasticsearch = builder.AddElasticsearch("elasticsearch")
    .WithContainerName("aspire-ecommerce-demo-elasticsearch")
    .WithImageTag("8.11.0")
    .WithEnvironment("discovery.type", "single-node")
    .WithEnvironment("xpack.security.enabled", "false")
    .WithEnvironment("ES_JAVA_OPTS", "-Xms512m -Xmx512m")
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Persistent);

// Kibana come container separato
var kibana = builder.AddContainer("kibana", "docker.elastic.co/kibana/kibana", "8.11.0")
    .WithContainerName("aspire-ecommerce-demo-kibana")
    .WithEnvironment("ELASTICSEARCH_HOSTS", "http://elasticsearch:9200")
    .WithHttpEndpoint(port: 5601, targetPort: 5601, name: "kibana-http")
    .WithLifetime(ContainerLifetime.Persistent)
    .WaitFor(elasticsearch);

var api = builder.AddProject<Projects.EcommerceDemo_Api>("api")
    .WithReference(elasticsearch)
    .WaitFor(elasticsearch);

var frontend = builder.AddNpmApp("frontend", "../../frontend", "dev")
    .WithHttpEndpoint(port: 3000, targetPort: 3000, name: "frontend-http", isProxied: false)
    .WithEnvironment("PORT", "3000")
    .WithReference(api)
    .WaitFor(api);

await builder.Build().RunAsync();
