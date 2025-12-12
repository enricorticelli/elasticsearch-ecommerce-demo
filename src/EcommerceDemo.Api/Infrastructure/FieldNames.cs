using System.Linq.Expressions;
using System.Text.Json;
using EcommerceDemo.Api.Models;

namespace EcommerceDemo.Api.Infrastructure;

/// <summary>
/// Helper statico per costruire i nomi dei campi Elasticsearch partendo da espressioni tipizzate.
/// </summary>
public static class FieldNames
{
    private static readonly JsonNamingPolicy NamingPolicy = JsonNamingPolicy.CamelCase;

    /// <summary>
    /// Ottiene il nome del campo Elasticsearch da un'espressione.
    /// </summary>
    public static string Get<T>(Expression<Func<T, object?>> expression)
        => GetFieldName(expression);

    /// <summary>
    /// Ottiene il nome del campo Elasticsearch con suffisso .keyword
    /// </summary>
    public static string Keyword<T>(Expression<Func<T, object?>> expression)
        => $"{GetFieldName(expression)}.keyword";

    /// <summary>
    /// Ottiene il path per un campo nested, es: "categories.name"
    /// </summary>
    public static string Nested<TParent, TNested>(
        Expression<Func<TParent, IEnumerable<TNested>>> parentExpr,
        Expression<Func<TNested, object?>> nestedExpr)
    {
        var parentName = GetFieldName(parentExpr);
        var nestedName = GetFieldName(nestedExpr);
        return $"{parentName}.{nestedName}";
    }

    /// <summary>
    /// Ottiene il path per un campo nested con suffisso .keyword
    /// </summary>
    public static string NestedKeyword<TParent, TNested>(
        Expression<Func<TParent, IEnumerable<TNested>>> parentExpr,
        Expression<Func<TNested, object?>> nestedExpr)
        => $"{Nested(parentExpr, nestedExpr)}.keyword";

    private static string GetFieldName<T>(Expression<Func<T, object?>> expression)
    {
        var member = GetMemberExpression(expression);
        return GetJsonPropertyName(member);
    }

    private static string GetFieldName<T, TResult>(Expression<Func<T, TResult>> expression)
    {
        var member = GetMemberExpressionGeneric(expression);
        return GetJsonPropertyName(member);
    }

    private static MemberExpression GetMemberExpression<T>(Expression<Func<T, object?>> expression)
    {
        return expression.Body switch
        {
            MemberExpression memberExpr => memberExpr,
            UnaryExpression { Operand: MemberExpression operandMemberExpr } => operandMemberExpr,
            _ => throw new ArgumentException($"Expression '{expression}' is not a valid member expression.")
        };
    }

    private static MemberExpression GetMemberExpressionGeneric<T, TResult>(Expression<Func<T, TResult>> expression)
    {
        return expression.Body switch
        {
            MemberExpression memberExpr => memberExpr,
            UnaryExpression { Operand: MemberExpression operandMemberExpr } => operandMemberExpr,
            _ => throw new ArgumentException($"Expression '{expression}' is not a valid member expression.")
        };
    }

    private static string GetJsonPropertyName(MemberExpression memberExpr)
    {
        var memberName = memberExpr.Member.Name;
        return NamingPolicy.ConvertName(memberName);
    }
}

/// <summary>
/// Costanti per i nomi dei campi Elasticsearch del modello Product.
/// Usate per evitare magic string nelle query e aggregazioni.
/// </summary>
public static class ProductFields
{
    // Campi semplici
    public static string Id => FieldNames.Get<Product>(p => p.Id);
    public static string Name => FieldNames.Get<Product>(p => p.Name);
    public static string Description => FieldNames.Get<Product>(p => p.Description);
    public static string Price => FieldNames.Get<Product>(p => p.Price);
    public static string Brand => FieldNames.Get<Product>(p => p.Brand);
    public static string BrandKeyword => FieldNames.Keyword<Product>(p => p.Brand);
    public static string Stock => FieldNames.Get<Product>(p => p.Stock);
    public static string ImageUrl => FieldNames.Get<Product>(p => p.ImageUrl);
    public static string CreatedAt => FieldNames.Get<Product>(p => p.CreatedAt);

    // Campi nested per Categories
    public static string Categories => FieldNames.Get<Product>(p => p.Categories);
    public static string CategoriesName => FieldNames.Nested<Product, CategoryNode>(p => p.Categories, c => c.Name);
    public static string CategoriesNameKeyword => FieldNames.NestedKeyword<Product, CategoryNode>(p => p.Categories, c => c.Name);
    public static string CategoriesLevel => FieldNames.Nested<Product, CategoryNode>(p => p.Categories, c => c.Level);
}

