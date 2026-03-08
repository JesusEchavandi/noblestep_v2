namespace NobleStep.Api.Models;

/// <summary>
/// Representa un cliente registrado en la tienda en línea (ecommerce).
/// Tabla: clientes_ecommerce
/// </summary>
public class ClienteEcommerce
{
    public int Id { get; set; }

    /// <summary>Correo electrónico (usado como identificador de login).</summary>
    public string Correo { get; set; } = string.Empty;

    /// <summary>Hash BCrypt de la contraseña.</summary>
    public string HashContrasena { get; set; } = string.Empty;

    /// <summary>Nombre completo del cliente.</summary>
    public string NombreCompleto { get; set; } = string.Empty;

    /// <summary>Número de teléfono.</summary>
    public string? Telefono { get; set; }

    /// <summary>Número de documento (DNI).</summary>
    public string? NumeroDocumento { get; set; }

    /// <summary>Dirección de envío.</summary>
    public string? Direccion { get; set; }

    /// <summary>Ciudad.</summary>
    public string? Ciudad { get; set; }

    /// <summary>Distrito.</summary>
    public string? Distrito { get; set; }

    /// <summary>Indica si el cliente está activo.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Indica si el correo fue verificado.</summary>
    public bool CorreoVerificado { get; set; } = false;

    /// <summary>Token para recuperación de contraseña.</summary>
    public string? TokenRecuperacion { get; set; }

    /// <summary>Fecha de expiración del token de recuperación.</summary>
    public DateTime? ExpiracionRecuperacion { get; set; }

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    // Token de refresco
    /// <summary>Hash SHA256 del refresh token activo.</summary>
    public string? HashTokenRefresco { get; set; }

    /// <summary>Fecha de expiración del refresh token.</summary>
    public DateTime? ExpiracionTokenRefresco { get; set; }

    // Propiedad de navegación
    /// <summary>Pedidos realizados por este cliente.</summary>
    public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}
