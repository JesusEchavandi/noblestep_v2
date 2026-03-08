using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class ProveedorDto
{
    public int Id { get; set; }
    public string NombreEmpresa { get; set; } = string.Empty;
    public string NombreContacto { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Ciudad { get; set; } = string.Empty;
    public string Pais { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public class CrearProveedorDto
{
    [Required(ErrorMessage = "El nombre de la empresa es requerido")]
    [MaxLength(100)]
    public string NombreEmpresa { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del contacto es requerido")]
    [MaxLength(100)]
    public string NombreContacto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El número de documento es requerido")]
    [MaxLength(20)]
    public string NumeroDocumento { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es requerido")]
    [MaxLength(15)]
    public string Telefono { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(100)]
    public string Correo { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Direccion { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Ciudad { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Pais { get; set; } = string.Empty;
}

public class ActualizarProveedorDto
{
    [Required]
    [MaxLength(100)]
    public string NombreEmpresa { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string NombreContacto { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string NumeroDocumento { get; set; } = string.Empty;

    [Required]
    [MaxLength(15)]
    public string Telefono { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Correo { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Direccion { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Ciudad { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Pais { get; set; } = string.Empty;

    public bool Activo { get; set; }
}
