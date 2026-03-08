using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NobleStep.Api.Models;

/// <summary>
/// Representa una línea (ítem) dentro de una compra a proveedor.
/// Tabla: detalle_compras
/// </summary>
public class DetalleCompra
{
    [Key]
    public int Id { get; set; }

    /// <summary>ID de la compra a la que pertenece.</summary>
    [Required]
    public int CompraId { get; set; }

    /// <summary>ID del producto comprado.</summary>
    [Required]
    public int ProductoId { get; set; }

    /// <summary>ID de la variante (talla) a la que se suma stock. Null = producto sin variantes.</summary>
    public int? VarianteId { get; set; }

    /// <summary>Cantidad comprada.</summary>
    [Required]
    public int Cantidad { get; set; }

    /// <summary>Costo unitario de compra.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CostoUnitario { get; set; }

    /// <summary>Subtotal = Cantidad × CostoUnitario.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    // Propiedades de navegación
    /// <summary>Compra a la que pertenece este detalle.</summary>
    [ForeignKey("CompraId")]
    public Compra Compra { get; set; } = null!;

    /// <summary>Producto comprado.</summary>
    [ForeignKey("ProductoId")]
    public Producto Producto { get; set; } = null!;

    /// <summary>Variante de talla (opcional).</summary>
    [ForeignKey("VarianteId")]
    public VarianteProducto? Variante { get; set; }
}
