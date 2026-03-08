using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class InicioSesionDto
{
    [Required(ErrorMessage = "El usuario es requerido")]
    [MaxLength(50)]
    public string NombreUsuario { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MaxLength(100)]
    public string Contrasena { get; set; } = string.Empty;
}

public class UsuarioDto
{
    public int Id { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public DateTime CreadoEn { get; set; }
}

public class CrearUsuarioDto
{
    public string NombreUsuario { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public string Rol { get; set; } = "Vendedor"; // Administrador, Vendedor
}

public class ActualizarUsuarioDto
{
    public string NombreUsuario { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string? Contrasena { get; set; } // Opcional — solo se actualiza si se proporciona
    public string Rol { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public class RespuestaInicioSesionDto
{
    public string Token { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime ExpiraEn { get; set; }
}

public class RegistroDto
{
    [Required(ErrorMessage = "El usuario es requerido")]
    [MaxLength(50, ErrorMessage = "El usuario no puede superar 50 caracteres")]
    public string NombreUsuario { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    [MaxLength(100, ErrorMessage = "La contraseña no puede superar 100 caracteres")]
    public string Contrasena { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre completo es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar 100 caracteres")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El formato de email no es válido")]
    [MaxLength(100, ErrorMessage = "El email no puede superar 100 caracteres")]
    public string Correo { get; set; } = string.Empty;

    [MaxLength(20, ErrorMessage = "El rol no puede superar 20 caracteres")]
    public string Rol { get; set; } = "Vendedor";
}

public class TokenRefrescoDto
{
    public string TokenRefresco { get; set; } = string.Empty;
}

public class RespuestaInicioSesionConRefrescoDto
{
    public string Token { get; set; } = string.Empty;
    public string TokenRefresco { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime ExpiraEn { get; set; }
    public DateTime ExpiracionTokenRefresco { get; set; }
}
