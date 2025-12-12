using EcommerceDemo.Api.Endpoints;
using EcommerceDemo.Api.Extensions;
using EcommerceDemo.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseCors();

app.MapSetupEndpoints();
app.MapProductEndpoints();
app.MapMetadataEndpoints();

await app.RunAsync();
