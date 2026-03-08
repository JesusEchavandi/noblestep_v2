namespace NobleStep.Api.Models;

/// <summary>
/// Representa un cliente presencial (ventas en tienda física).
/// Tabla: clientes
/// </summary>
public class Cliente
{
    public int Id { get; set; }

    /// <summary>Nombre completo del cliente.</summary>
    public string NombreCompleto { get; set; } = string.Empty;

    /// <summary>Número de documento (DNI/RUC).</summary>
    public string NumeroDocumento { get; set; } = string.Empty;

    /// <summary>Número de teléfono.</summary>
    public string Telefono { get; set; } = string.Empty;

    /// <summary>Correo electrónico.</summary>
    public string Correo { get; set; } = string.Empty;

    /// <summary>Indica si el cliente está activo.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime? FechaActualizacion { get; set; }

    /// <summary>Nombre de usuario del admin que creó el registro.</summary>
    public string? CreadoPor { get; set; }

    // Propiedad de navegación
    /// <summary>Ventas asociadas a este cliente.</summary>
    public ICollection<Venta> Ventas { get; set; } = new List<Venta>();
}
