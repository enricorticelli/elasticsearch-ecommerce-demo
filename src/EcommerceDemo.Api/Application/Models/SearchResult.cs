namespace EcommerceDemo.Api.Application.Models;

public record SearchResult<T>(
    long Total,
    int Page,
    int PageSize,
    IReadOnlyCollection<T> Items,
    decimal? MinPrice,
    decimal? MaxPrice);
