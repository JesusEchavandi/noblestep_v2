using NobleStep.Api.Helpers;

namespace NobleStep.Api.Models;

/// <summary>
/// Representa un usuario del sistema administrativo (administrador o vendedor).
/// Tabla: usuarios
/// </summary>
public class Usuario
{
    public int Id { get; set; }

    /// <summary>Nombre de usuario único para inicio de sesión.</summary>
    public string NombreUsuario { get; set; } = string.Empty;

    /// <summary>Hash BCrypt de la contraseña.</summary>
    public string HashContrasena { get; set; } = string.Empty;

    /// <summary>Nombre completo del usuario.</summary>
    public string NombreCompleto { get; set; } = string.Empty;

    /// <summary>Correo electrónico del usuario.</summary>
    public string Correo { get; set; } = string.Empty;

    /// <summary>Rol del usuario: Administrador o Vendedor.</summary>
    public string Rol { get; set; } = "Vendedor";

    /// <summary>Indica si el usuario está activo en el sistema.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTimeHelper.GetPeruDateTime();

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime? FechaActualizacion { get; set; }

    /// <summary>Nombre de usuario del admin que creó este registro.</summary>
    public string? CreadoPor { get; set; }

    // Token de refresco
    /// <summary>Hash SHA256 del refresh token activo.</summary>
    public string? HashTokenRefresco { get; set; }

    /// <summary>Fecha de expiración del refresh token.</summary>
    public DateTime? ExpiracionTokenRefresco { get; set; }
}
