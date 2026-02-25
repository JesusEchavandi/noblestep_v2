using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class CustomerDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateCustomerDto
{
    [Required(ErrorMessage = "El nombre completo es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar 100 caracteres")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El número de documento es requerido")]
    [MaxLength(20, ErrorMessage = "El documento no puede superar 20 caracteres")]
    public string DocumentNumber { get; set; } = string.Empty;

    [MaxLength(20, ErrorMessage = "El teléfono no puede superar 20 caracteres")]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "El email no puede superar 100 caracteres")]
    [EmailAddress(ErrorMessage = "El formato de email no es válido")]
    public string Email { get; set; } = string.Empty;
}
