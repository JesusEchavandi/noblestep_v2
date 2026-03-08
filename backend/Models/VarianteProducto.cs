using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.Models;

/// <summary>
/// Representa una variante de talla de un producto con stock individual.
/// Tabla: variantes_producto
/// </summary>
public class VarianteProducto
{
    public int Id { get; set; }

    /// <summary>ID del producto al que pertenece esta variante.</summary>
    public int ProductoId { get; set; }

    /// <summary>Talla del calzado: "38", "39", "40", "41", "42", "43", "44".</summary>
    public string Talla { get; set; } = string.Empty;

    /// <summary>Stock disponible para esta talla.</summary>
    [ConcurrencyCheck]
    public int Stock { get; set; } = 0;

    /// <summary>Indica si esta variante está activa.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime? FechaActualizacion { get; set; }

    // Propiedad de navegación
    /// <summary>Producto al que pertenece esta variante.</summary>
    public Producto Producto { get; set; } = null!;
}
