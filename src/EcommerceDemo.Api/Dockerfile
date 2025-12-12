FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/EcommerceDemo.Api/EcommerceDemo.Api.csproj", "EcommerceDemo.Api/"]
COPY ["src/EcommerceDemo.ServiceDefaults/EcommerceDemo.ServiceDefaults.csproj", "EcommerceDemo.ServiceDefaults/"]
RUN dotnet restore "EcommerceDemo.Api/EcommerceDemo.Api.csproj"
COPY src/ .
WORKDIR "/src/EcommerceDemo.Api"
RUN dotnet build "EcommerceDemo.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EcommerceDemo.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EcommerceDemo.Api.dll"]
