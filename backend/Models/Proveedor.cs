using System.ComponentModel.DataAnnotations;
using NobleStep.Api.Helpers;

namespace NobleStep.Api.Models;

/// <summary>
/// Representa un proveedor de productos.
/// Tabla: proveedores
/// </summary>
public class Proveedor
{
    [Key]
    public int Id { get; set; }

    /// <summary>Razón social o nombre de la empresa.</summary>
    [Required]
    [MaxLength(100)]
    public string RazonSocial { get; set; } = string.Empty;

    /// <summary>Nombre de la persona de contacto.</summary>
    [Required]
    [MaxLength(100)]
    public string NombreContacto { get; set; } = string.Empty;

    /// <summary>Número de documento (RUC).</summary>
    [Required]
    [MaxLength(20)]
    public string NumeroDocumento { get; set; } = string.Empty;

    /// <summary>Número de teléfono.</summary>
    [Required]
    [MaxLength(15)]
    public string Telefono { get; set; } = string.Empty;

    /// <summary>Correo electrónico.</summary>
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Correo { get; set; } = string.Empty;

    /// <summary>Dirección del proveedor.</summary>
    [MaxLength(200)]
    public string Direccion { get; set; } = string.Empty;

    /// <summary>Ciudad del proveedor.</summary>
    [MaxLength(100)]
    public string Ciudad { get; set; } = string.Empty;

    /// <summary>País del proveedor.</summary>
    [MaxLength(100)]
    public string Pais { get; set; } = string.Empty;

    /// <summary>Indica si el proveedor está activo.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTimeHelper.GetPeruDateTime();

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime? FechaActualizacion { get; set; }

    // Propiedad de navegación
    /// <summary>Compras realizadas a este proveedor.</summary>
    public ICollection<Compra> Compras { get; set; } = new List<Compra>();
}
