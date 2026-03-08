namespace NobleStep.Api.Models;

/// <summary>
/// Representa una venta realizada en la tienda física.
/// Tabla: ventas
/// </summary>
public class Venta
{
    public int Id { get; set; }

    /// <summary>ID del cliente que realizó la compra.</summary>
    public int ClienteId { get; set; }

    /// <summary>ID del usuario (vendedor) que registró la venta.</summary>
    public int UsuarioId { get; set; }

    /// <summary>Fecha y hora de la venta.</summary>
    public DateTime FechaVenta { get; set; } = DateTime.UtcNow;

    /// <summary>Monto total de la venta.</summary>
    public decimal Total { get; set; }

    /// <summary>Estado de la venta (Completada, Anulada, etc.).</summary>
    public string Estado { get; set; } = "Completada";

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime? FechaActualizacion { get; set; }

    /// <summary>Nombre de usuario del vendedor que registró la venta.</summary>
    public string? CreadoPor { get; set; }

    // Propiedades de navegación
    /// <summary>Cliente asociado a la venta.</summary>
    public Cliente Cliente { get; set; } = null!;

    /// <summary>Usuario (vendedor) que registró la venta.</summary>
    public Usuario Usuario { get; set; } = null!;

    /// <summary>Detalles (líneas) de la venta.</summary>
    public ICollection<DetalleVenta> DetallesVenta { get; set; } = new List<DetalleVenta>();
}
