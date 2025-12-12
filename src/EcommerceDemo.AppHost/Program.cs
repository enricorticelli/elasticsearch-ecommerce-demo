using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

const string projectName = "ecommerce-demo";

var elasticsearch = builder.AddElasticsearch("elasticsearch")
    .WithContainerName($"{projectName}-elasticsearch")
    .WithImageTag("8.11.0")
    .WithEnvironment("discovery.type", "single-node")
    .WithEnvironment("xpack.security.enabled", "false")
    .WithEnvironment("ES_JAVA_OPTS", "-Xms512m -Xmx512m")
    .WithDataVolume()
    .WithContainerRuntimeArgs("--label", $"com.docker.compose.project={projectName}");

// Kibana come container separato
var kibana = builder.AddContainer("kibana", "docker.elastic.co/kibana/kibana", "8.11.0")
    .WithContainerName($"{projectName}-kibana")
    .WithEnvironment("ELASTICSEARCH_HOSTS", "http://elasticsearch:9200")
    .WithHttpEndpoint(port: 5601, targetPort: 5601, name: "kibana-http")
    .WithContainerRuntimeArgs("--label", $"com.docker.compose.project={projectName}")
    .WaitFor(elasticsearch);

var api = builder.AddProject<Projects.EcommerceDemo_Api>("api")
    .WithReference(elasticsearch)
    .WaitFor(elasticsearch);

var apiHttpEndpoint = api.GetEndpoint("http");

var frontend = builder.AddNpmApp("frontend", "../frontend", "dev")
    .WithHttpEndpoint(port: 3000, targetPort: 3000, name: "frontend-http", isProxied: false)
    .WithEnvironment("PORT", "3000")
    .WithEnvironment("NEXT_PUBLIC_API_URL", apiHttpEndpoint)
    .WithNpmPackageInstallation()
    .WithReference(api)
    .WaitFor(api);

await builder.Build().RunAsync();
