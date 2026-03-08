namespace NobleStep.Api.Models;

/// <summary>
/// Representa una línea (ítem) dentro de un pedido de ecommerce.
/// Tabla: detalle_pedidos
/// </summary>
public class DetallePedido
{
    public int Id { get; set; }

    /// <summary>ID del pedido al que pertenece.</summary>
    public int PedidoId { get; set; }

    /// <summary>ID del producto.</summary>
    public int ProductoId { get; set; }

    // Información del producto (snapshot al momento del pedido)
    /// <summary>Nombre del producto al momento del pedido.</summary>
    public string NombreProducto { get; set; } = string.Empty;

    /// <summary>Código del producto.</summary>
    public string CodigoProducto { get; set; } = string.Empty;

    /// <summary>Talla del producto.</summary>
    public string? TallaProducto { get; set; }

    /// <summary>Marca del producto.</summary>
    public string? MarcaProducto { get; set; }

    /// <summary>Cantidad pedida.</summary>
    public int Cantidad { get; set; }

    /// <summary>Precio unitario al momento del pedido.</summary>
    public decimal PrecioUnitario { get; set; }

    /// <summary>Subtotal = Cantidad × PrecioUnitario.</summary>
    public decimal Subtotal { get; set; }

    // Propiedades de navegación
    /// <summary>Pedido al que pertenece este detalle.</summary>
    public Pedido Pedido { get; set; } = null!;

    /// <summary>Producto del detalle.</summary>
    public Producto Producto { get; set; } = null!;
}
