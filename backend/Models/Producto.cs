using System.ComponentModel.DataAnnotations;
using NobleStep.Api.Helpers;

namespace NobleStep.Api.Models;

/// <summary>
/// Representa un producto de calzado en el inventario.
/// Tabla: productos
/// </summary>
public class Producto
{
    public int Id { get; set; }

    /// <summary>Nombre del producto.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Marca del producto.</summary>
    public string Marca { get; set; } = string.Empty;

    /// <summary>ID de la categoría a la que pertenece.</summary>
    public int CategoriaId { get; set; }

    /// <summary>Talla principal del producto.</summary>
    public string Talla { get; set; } = string.Empty;

    /// <summary>Precio regular del producto.</summary>
    public decimal Precio { get; set; }

    /// <summary>Precio de oferta (0 = sin oferta).</summary>
    public decimal PrecioOferta { get; set; } = 0;

    /// <summary>Stock total disponible.</summary>
    [ConcurrencyCheck]
    public int Stock { get; set; }

    /// <summary>URL de la imagen del producto.</summary>
    public string? UrlImagen { get; set; }

    /// <summary>Descripción detallada del producto.</summary>
    public string? Descripcion { get; set; }

    /// <summary>Indica si el producto está activo.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTimeHelper.GetPeruDateTime();

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime? FechaActualizacion { get; set; }

    // Propiedades de navegación
    /// <summary>Categoría del producto.</summary>
    public Categoria Categoria { get; set; } = null!;

    /// <summary>Detalles de venta asociados a este producto.</summary>
    public ICollection<DetalleVenta> DetallesVenta { get; set; } = new List<DetalleVenta>();

    /// <summary>Variantes de talla del producto.</summary>
    public ICollection<VarianteProducto> Variantes { get; set; } = new List<VarianteProducto>();
}
