using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class VentaDto
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public DateTime FechaVenta { get; set; }
    public decimal Total { get; set; }
    public string Estado { get; set; } = string.Empty;
    public List<DetalleVentaDto> Detalles { get; set; } = new();
}

public class DetalleVentaDto
{
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public int? VarianteId { get; set; }
    public string? Talla { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class CrearVentaDto
{
    [Required(ErrorMessage = "El cliente es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "El ID de cliente debe ser mayor a 0")]
    public int ClienteId { get; set; }

    [Required(ErrorMessage = "Debe agregar al menos un detalle de venta")]
    [MinLength(1, ErrorMessage = "Debe agregar al menos un detalle de venta")]
    public List<CrearDetalleVentaDto> Detalles { get; set; } = new();
}

public class CrearDetalleVentaDto
{
    [Required(ErrorMessage = "El producto es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "El ID de producto debe ser mayor a 0")]
    public int ProductoId { get; set; }

    /// <summary>ID de la variante (talla) a vender. Obligatorio si el producto tiene variantes.</summary>
    public int? VarianteId { get; set; }

    [Required(ErrorMessage = "La cantidad es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
    public int Cantidad { get; set; }
}
