using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NobleStep.Api.Models;

/// <summary>
/// Representa una compra realizada a un proveedor.
/// Tabla: compras
/// </summary>
public class Compra
{
    [Key]
    public int Id { get; set; }

    /// <summary>ID del proveedor al que se le compró.</summary>
    [Required]
    public int ProveedorId { get; set; }

    /// <summary>ID del usuario que registró la compra.</summary>
    [Required]
    public int UsuarioId { get; set; }

    /// <summary>Fecha y hora de la compra.</summary>
    [Required]
    public DateTime FechaCompra { get; set; } = DateTime.UtcNow;

    /// <summary>Número de factura del proveedor.</summary>
    [Required]
    [MaxLength(50)]
    public string NumeroFactura { get; set; } = string.Empty;

    /// <summary>Monto total de la compra.</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    /// <summary>Estado de la compra (Completada, Pendiente, Anulada).</summary>
    [MaxLength(50)]
    public string Estado { get; set; } = "Completada";

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Notas adicionales sobre la compra.</summary>
    public string? Notas { get; set; }

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime? FechaActualizacion { get; set; }

    // Propiedades de navegación
    /// <summary>Proveedor de esta compra.</summary>
    [ForeignKey("ProveedorId")]
    public Proveedor Proveedor { get; set; } = null!;

    /// <summary>Usuario que registró la compra.</summary>
    [ForeignKey("UsuarioId")]
    public Usuario Usuario { get; set; } = null!;

    /// <summary>Detalles (líneas) de la compra.</summary>
    public ICollection<DetalleCompra> Detalles { get; set; } = new List<DetalleCompra>();
}
