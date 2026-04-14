using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class RegistroEcommerceDto
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(100)]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    [MaxLength(100)]
    public string Contrasena { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre completo es requerido")]
    [MaxLength(100)]
    public string NombreCompleto { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telefono { get; set; }
}

public class InicioSesionEcommerceDto
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    public string Contrasena { get; set; } = string.Empty;
}

public class RespuestaAutenticacionEcommerceDto
{
    public string Token { get; set; } = string.Empty;
    public string TokenRefresco { get; set; } = string.Empty;
    public DateTime ExpiracionTokenRefresco { get; set; }
    public ClienteEcommerceDto Cliente { get; set; } = null!;
}

public class TokenRefrescoEcommerceDto
{
    [Required(ErrorMessage = "El refresh token es requerido")]
    public string TokenRefresco { get; set; } = string.Empty;
}

public class ClienteEcommerceDto
{
    public int Id { get; set; }
    public string Correo { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? NumeroDocumento { get; set; }
    public string? Direccion { get; set; }
    public string? Ciudad { get; set; }
    public string? Distrito { get; set; }
    public bool CorreoVerificado { get; set; }
    public DateTime CreadoEn { get; set; }
}

public class OlvidoContrasenaDto
{
    public string Correo { get; set; } = string.Empty;
}

public class OlvidoContrasenaRespuestaDto
{
    public string Message { get; set; } = string.Empty;
    public string TokenRecuperacion { get; set; } = string.Empty;
    public int ExpiraEnMinutos { get; set; }
}

public class RestablecerContrasenaDto
{
    public string Token { get; set; } = string.Empty;
    public string NuevaContrasena { get; set; } = string.Empty;
}

public class ActualizarPerfilDto
{
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? NumeroDocumento { get; set; }
    public string? Direccion { get; set; }
    public string? Ciudad { get; set; }
    public string? Distrito { get; set; }
}
