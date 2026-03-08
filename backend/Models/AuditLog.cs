using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.Models;

/// <summary>
/// Registro de auditoría para acciones críticas del sistema.
/// Cumple con requisitos de trazabilidad para e-commerce peruano.
/// </summary>
public class AuditLog
{
    public int Id { get; set; }

    /// <summary>Timestamp UTC de la acción</summary>
    public DateTime FechaUtc { get; set; } = DateTime.UtcNow;

    /// <summary>ID del usuario que realizó la acción (null = sistema/anónimo)</summary>
    public int? UsuarioId { get; set; }

    /// <summary>Nombre de usuario para referencia rápida</summary>
    [MaxLength(100)]
    public string? NombreUsuario { get; set; }

    /// <summary>Tipo de acción: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.</summary>
    [Required]
    [MaxLength(50)]
    public string Accion { get; set; } = string.Empty;

    /// <summary>Entidad afectada: Usuario, Producto, Venta, Pedido, etc.</summary>
    [Required]
    [MaxLength(100)]
    public string Entidad { get; set; } = string.Empty;

    /// <summary>ID de la entidad afectada</summary>
    public int? EntidadId { get; set; }

    /// <summary>Descripción legible de la acción</summary>
    [MaxLength(500)]
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Dirección IP del cliente</summary>
    [MaxLength(45)]
    public string? DireccionIp { get; set; }

    /// <summary>Datos adicionales (JSON) — valores previos, cambios, etc.</summary>
    public string? DatosAdicionales { get; set; }
}
