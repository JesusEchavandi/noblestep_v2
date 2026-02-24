using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

// ── Lectura ──────────────────────────────────────────────────────────────
public class ProductVariantDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Stock { get; set; }
    public bool IsActive { get; set; }
}

// ── Creación ─────────────────────────────────────────────────────────────
public class CreateProductVariantDto
{
    [Required(ErrorMessage = "La talla es obligatoria")]
    [StringLength(10, ErrorMessage = "La talla no puede superar 10 caracteres")]
    public string Size { get; set; } = string.Empty;

    [Range(0, 10000, ErrorMessage = "El stock debe ser entre 0 y 10000")]
    public int Stock { get; set; } = 0;
}

// ── Actualización de stock ────────────────────────────────────────────────
public class UpdateVariantStockDto
{
    [Range(0, 10000, ErrorMessage = "El stock debe ser entre 0 y 10000")]
    public int Stock { get; set; }
}

// ── Ajuste de stock (para compras, devoluciones) ──────────────────────────
public class AdjustVariantStockDto
{
    [Required]
    public int VariantId { get; set; }

    /// <summary>Cantidad positiva = entrada, negativa = salida</summary>
    [Range(-10000, 10000)]
    public int Quantity { get; set; }

    [StringLength(255)]
    public string? Reason { get; set; }
}

// ── Resumen de disponibilidad (para la tienda) ────────────────────────────
public class ProductSizeAvailabilityDto
{
    public int VariantId { get; set; }
    public string Size { get; set; } = string.Empty;
    public int Stock { get; set; }
    public bool Available => Stock > 0;
}

// ── Producto con todas sus variantes ─────────────────────────────────────
public class ProductWithVariantsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? Code { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal SalePrice { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }

    /// <summary>Stock total sumado de todas las variantes activas</summary>
    public int TotalStock => Variants.Where(v => v.IsActive).Sum(v => v.Stock);

    public List<ProductVariantDto> Variants { get; set; } = new();
}
