namespace NobleStep.Api.DTOs;

// DTO para productos en el catálogo público (sin mostrar precio de compra)
public class ProductShopDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;

    /// <summary>
    /// Talla del producto (legacy: cuando no hay variantes).
    /// Si hay variantes, usar el campo Sizes.
    /// </summary>
    public string? Size { get; set; }

    public decimal Price { get; set; }
    public decimal SalePrice { get; set; }

    /// <summary>Stock total sumado de todas las variantes activas (o el campo Stock legacy)</summary>
    public int Stock { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    /// <summary>Tallas disponibles con stock individual — vacío si el producto no tiene variantes</summary>
    public List<ProductSizeDto> Sizes { get; set; } = new();
}

/// <summary>Talla disponible con su stock y ID de variante para agregar al carrito</summary>
public class ProductSizeDto
{
    public int VariantId { get; set; }
    public string Size { get; set; } = string.Empty;
    public int Stock { get; set; }
    public bool Available => Stock > 0;
}

// DTO para categorías en el catálogo público
public class CategoryShopDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ProductCount { get; set; }
}

// DTO para formulario de contacto
public class ContactDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
