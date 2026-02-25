using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal SalePrice { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class CreateProductDto
{
    [Required(ErrorMessage = "El nombre del producto es requerido")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "La marca es requerida")]
    [MaxLength(100, ErrorMessage = "La marca no puede superar 100 caracteres")]
    public string Brand { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "El ID de categoría debe ser mayor a 0")]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "La talla es requerida")]
    [MaxLength(20, ErrorMessage = "La talla no puede superar 20 caracteres")]
    public string Size { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es requerido")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
    public decimal Price { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El precio de oferta no puede ser negativo")]
    public decimal SalePrice { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo")]
    public int Stock { get; set; }

    [MaxLength(500, ErrorMessage = "La URL de imagen no puede superar 500 caracteres")]
    public string? ImageUrl { get; set; }

    [MaxLength(1000, ErrorMessage = "La descripción no puede superar 1000 caracteres")]
    public string? Description { get; set; }
}

public class UpdateProductDto
{
    [Required(ErrorMessage = "El nombre del producto es requerido")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "La marca es requerida")]
    [MaxLength(100, ErrorMessage = "La marca no puede superar 100 caracteres")]
    public string Brand { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "El ID de categoría debe ser mayor a 0")]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "La talla es requerida")]
    [MaxLength(20, ErrorMessage = "La talla no puede superar 20 caracteres")]
    public string Size { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es requerido")]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
    public decimal Price { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El precio de oferta no puede ser negativo")]
    public decimal SalePrice { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo")]
    public int Stock { get; set; }

    [MaxLength(500, ErrorMessage = "La URL de imagen no puede superar 500 caracteres")]
    public string? ImageUrl { get; set; }

    [MaxLength(1000, ErrorMessage = "La descripción no puede superar 1000 caracteres")]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}
