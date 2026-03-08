using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class ClienteDto
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public class CrearClienteDto
{
    [Required(ErrorMessage = "El nombre completo es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar 100 caracteres")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El número de documento es requerido")]
    [MaxLength(20, ErrorMessage = "El documento no puede superar 20 caracteres")]
    public string NumeroDocumento { get; set; } = string.Empty;

    [MaxLength(20, ErrorMessage = "El teléfono no puede superar 20 caracteres")]
    public string Telefono { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "El email no puede superar 100 caracteres")]
    [EmailAddress(ErrorMessage = "El formato de email no es válido")]
    public string Correo { get; set; } = string.Empty;
}
