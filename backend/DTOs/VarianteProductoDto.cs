using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

// ── Lectura ──────────────────────────────────────────────────────────────
public class VarianteProductoDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Talla { get; set; } = string.Empty;
    public int Stock { get; set; }
    public bool Activo { get; set; }
}

// ── Creación ─────────────────────────────────────────────────────────────
public class CrearVarianteProductoDto
{
    [Required(ErrorMessage = "La talla es obligatoria")]
    [StringLength(10, ErrorMessage = "La talla no puede superar 10 caracteres")]
    public string Talla { get; set; } = string.Empty;

    [Range(0, 10000, ErrorMessage = "El stock debe ser entre 0 y 10000")]
    public int Stock { get; set; } = 0;
}

// ── Actualización de stock ────────────────────────────────────────────────
public class ActualizarStockVarianteDto
{
    [Range(0, 10000, ErrorMessage = "El stock debe ser entre 0 y 10000")]
    public int Stock { get; set; }
}

// ── Ajuste de stock (para compras, devoluciones) ──────────────────────────
public class AjustarStockVarianteDto
{
    [Required]
    public int VarianteId { get; set; }

    /// <summary>Cantidad positiva = entrada, negativa = salida</summary>
    [Range(-10000, 10000)]
    public int Cantidad { get; set; }

    [StringLength(255)]
    public string? Motivo { get; set; }
}

// ── Resumen de disponibilidad (para la tienda) ────────────────────────────
public class DisponibilidadTallaProductoDto
{
    public int VarianteId { get; set; }
    public string Talla { get; set; } = string.Empty;
    public int Stock { get; set; }
    public bool Disponible => Stock > 0;
}

// ── Producto con todas sus variantes ─────────────────────────────────────
public class ProductoConVariantesDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public int CategoriaId { get; set; }
    public string NombreCategoria { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public decimal PrecioVenta { get; set; }
    public string? UrlImagen { get; set; }
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }

    /// <summary>Stock total sumado de todas las variantes activas</summary>
    public int StockTotal => Variantes.Where(v => v.Activo).Sum(v => v.Stock);

    public List<VarianteProductoDto> Variantes { get; set; } = new();
}
