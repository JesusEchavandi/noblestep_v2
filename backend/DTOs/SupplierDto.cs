using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class SupplierDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateSupplierDto
{
    [Required(ErrorMessage = "El nombre de la empresa es requerido")]
    [MaxLength(100)]
    public string CompanyName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del contacto es requerido")]
    [MaxLength(100)]
    public string ContactName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El número de documento es requerido")]
    [MaxLength(20)]
    public string DocumentNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es requerido")]
    [MaxLength(15)]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Country { get; set; } = string.Empty;
}

public class UpdateSupplierDto
{
    [Required]
    [MaxLength(100)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ContactName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string DocumentNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(15)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Country { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}
