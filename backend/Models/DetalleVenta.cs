namespace NobleStep.Api.Models;

/// <summary>
/// Representa una línea (ítem) dentro de una venta.
/// Tabla: detalle_ventas
/// </summary>
public class DetalleVenta
{
    public int Id { get; set; }

    /// <summary>ID de la venta a la que pertenece.</summary>
    public int VentaId { get; set; }

    /// <summary>ID del producto vendido.</summary>
    public int ProductoId { get; set; }

    /// <summary>ID de la variante (talla) vendida. Null = venta sin variante (legacy).</summary>
    public int? VarianteId { get; set; }

    /// <summary>Cantidad vendida.</summary>
    public int Cantidad { get; set; }

    /// <summary>Precio unitario al momento de la venta.</summary>
    public decimal PrecioUnitario { get; set; }

    /// <summary>Subtotal = Cantidad × PrecioUnitario.</summary>
    public decimal Subtotal { get; set; }

    // Propiedades de navegación
    /// <summary>Venta a la que pertenece este detalle.</summary>
    public Venta Venta { get; set; } = null!;

    /// <summary>Producto vendido.</summary>
    public Producto Producto { get; set; } = null!;

    /// <summary>Variante de talla vendida (opcional).</summary>
    public VarianteProducto? Variante { get; set; }
}
