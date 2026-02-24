using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class PurchaseDto
{
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public List<PurchaseDetailDto> Details { get; set; } = new();
}

public class PurchaseDetailDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? VariantId { get; set; }
    public string? Size { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal Subtotal { get; set; }
}

public class CreatePurchaseDto
{
    [Required(ErrorMessage = "El proveedor es requerido")]
    public int SupplierId { get; set; }

    [Required(ErrorMessage = "La fecha de compra es requerida")]
    public DateTime PurchaseDate { get; set; }

    [Required(ErrorMessage = "El número de factura es requerido")]
    [MaxLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Notes { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe agregar al menos un detalle de compra")]
    public List<CreatePurchaseDetailDto> Details { get; set; } = new();
}

public class CreatePurchaseDetailDto
{
    [Required]
    public int ProductId { get; set; }

    /// <summary>
    /// ID de la variante (talla) a la que se suma el stock.
    /// Si es null y se especifica Size, se crea la variante automáticamente.
    /// </summary>
    public int? VariantId { get; set; }

    /// <summary>
    /// Talla del producto recibido (ej: "42"). Usado si VariantId es null.
    /// </summary>
    public string? Size { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
    public int Quantity { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El costo unitario debe ser mayor a 0")]
    public decimal UnitCost { get; set; }
}

public class PurchaseDetailVariantDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? VariantId { get; set; }
    public string? Size { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal Subtotal { get; set; }
}
