namespace NobleStep.Api.DTOs;

public class SaleDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<SaleDetailDto> Details { get; set; } = new();
}

public class SaleDetailDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? VariantId { get; set; }
    public string? Size { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}

public class CreateSaleDto
{
    public int CustomerId { get; set; }
    public List<CreateSaleDetailDto> Details { get; set; } = new();
}

public class CreateSaleDetailDto
{
    public int ProductId { get; set; }

    /// <summary>ID de la variante (talla) a vender. Obligatorio si el producto tiene variantes.</summary>
    public int? VariantId { get; set; }

    public int Quantity { get; set; }
}
