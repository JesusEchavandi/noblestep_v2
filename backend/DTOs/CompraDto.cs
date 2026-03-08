using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class CompraDto
{
    public int Id { get; set; }
    public int ProveedorId { get; set; }
    public string NombreProveedor { get; set; } = string.Empty;
    public DateTime FechaCompra { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Notas { get; set; }
    public List<DetalleCompraDto> Detalles { get; set; } = new();
}

public class DetalleCompraDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public int? VarianteId { get; set; }
    public string? Talla { get; set; }
    public int Cantidad { get; set; }
    public decimal CostoUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class CrearCompraDto
{
    [Required(ErrorMessage = "El proveedor es requerido")]
    public int ProveedorId { get; set; }

    [Required(ErrorMessage = "La fecha de compra es requerida")]
    public DateTime FechaCompra { get; set; }

    /// <summary>Se ignora — el backend genera el Nº de Compra automáticamente.</summary>
    public string? NumeroFactura { get; set; }

    [MaxLength(500)]
    public string Notas { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe agregar al menos un detalle de compra")]
    public List<CrearDetalleCompraDto> Detalles { get; set; } = new();
}

public class CrearDetalleCompraDto
{
    [Required]
    public int ProductoId { get; set; }

    /// <summary>
    /// ID de la variante (talla) a la que se suma el stock.
    /// Si es null y se especifica Talla, se crea la variante automáticamente.
    /// </summary>
    public int? VarianteId { get; set; }

    /// <summary>
    /// Talla del producto recibido (ej: "42"). Usado si VarianteId es null.
    /// </summary>
    public string? Talla { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
    public int Cantidad { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El costo unitario debe ser mayor a 0")]
    public decimal CostoUnitario { get; set; }
}

public class DetalleCompraVarianteDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public int? VarianteId { get; set; }
    public string? Talla { get; set; }
    public int Cantidad { get; set; }
    public decimal CostoUnitario { get; set; }
    public decimal Subtotal { get; set; }
}
