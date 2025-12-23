using EcommerceDemo.Api.Models;

namespace EcommerceDemo.Api.Application.Models;

public record AutocompleteHit(Product Product, string? Highlight);
