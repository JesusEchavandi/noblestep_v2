using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class ProductoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
    public string NombreCategoria { get; set; } = string.Empty;
    public string Talla { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public decimal PrecioVenta { get; set; }
    public int Stock { get; set; }
    public string? UrlImagen { get; set; }
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
    public List<VarianteProductoDto> Variantes { get; set; } = new();
}

public class CrearProductoDto
{
    [Required(ErrorMessage = "El nombre del producto es requerido")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La marca es requerida")]
    [MaxLength(100, ErrorMessage = "La marca no puede superar 100 caracteres")]
    public string Marca { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "El ID de categoría debe ser mayor a 0")]
    public int CategoriaId { get; set; }

    [Required(ErrorMessage = "La talla es requerida")]
    [MaxLength(20, ErrorMessage = "La talla no puede superar 20 caracteres")]
    public string Talla { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es requerido")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
    public decimal Precio { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El precio de oferta no puede ser negativo")]
    public decimal PrecioVenta { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo")]
    public int Stock { get; set; }

    [MaxLength(500, ErrorMessage = "La URL de imagen no puede superar 500 caracteres")]
    public string? UrlImagen { get; set; }

    [MaxLength(1000, ErrorMessage = "La descripción no puede superar 1000 caracteres")]
    public string? Descripcion { get; set; }
}

public class ActualizarProductoDto
{
    [Required(ErrorMessage = "El nombre del producto es requerido")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La marca es requerida")]
    [MaxLength(100, ErrorMessage = "La marca no puede superar 100 caracteres")]
    public string Marca { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "El ID de categoría debe ser mayor a 0")]
    public int CategoriaId { get; set; }

    [Required(ErrorMessage = "La talla es requerida")]
    [MaxLength(20, ErrorMessage = "La talla no puede superar 20 caracteres")]
    public string Talla { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es requerido")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
    public decimal Precio { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El precio de oferta no puede ser negativo")]
    public decimal PrecioVenta { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo")]
    public int Stock { get; set; }

    [MaxLength(500, ErrorMessage = "La URL de imagen no puede superar 500 caracteres")]
    public string? UrlImagen { get; set; }

    [MaxLength(1000, ErrorMessage = "La descripción no puede superar 1000 caracteres")]
    public string? Descripcion { get; set; }

    public bool Activo { get; set; }
}
