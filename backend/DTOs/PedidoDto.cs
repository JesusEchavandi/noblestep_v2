namespace NobleStep.Api.DTOs;

public class CrearPedidoDto
{
    // Cliente
    public string NombreCompletoCliente { get; set; } = string.Empty;
    public string CorreoCliente { get; set; } = string.Empty;
    public string TelefonoCliente { get; set; } = string.Empty;
    public string DireccionCliente { get; set; } = string.Empty;
    public string CiudadCliente { get; set; } = string.Empty;
    public string DistritoCliente { get; set; } = string.Empty;
    public string? ReferenciaCliente { get; set; }
    public string? NumeroDocumentoCliente { get; set; }
    
    // Pago
    public string MetodoPago { get; set; } = string.Empty;
    public string? DetallesPago { get; set; }
    public string? ComprobanteBase64 { get; set; } // Comprobante en Base64
    
    // Facturación
    public string TipoComprobante { get; set; } = "Boleta";
    public string? NombreEmpresa { get; set; }
    public string? RucEmpresa { get; set; }
    public string? DireccionEmpresa { get; set; }
    
    // Productos
    public List<ItemPedidoDto> Items { get; set; } = new();
}

public class ItemPedidoDto
{
    public int ProductoId { get; set; }

    /// <summary>
    /// ID de la variante (talla) seleccionada por el cliente.
    /// Si es null, se descuenta del stock legacy del producto directamente.
    /// </summary>
    public int? VarianteId { get; set; }

    public int Cantidad { get; set; }
    // PrecioUnitario eliminado: el precio siempre se calcula desde la BD en el backend.
    // El cliente NO puede enviar ni manipular el precio.
}

public class RespuestaPedidoDto
{
    public int Id { get; set; }
    public string NumeroPedido { get; set; } = string.Empty;
    public string NombreCompletoCliente { get; set; } = string.Empty;
    public string CorreoCliente { get; set; } = string.Empty;
    public string TelefonoCliente { get; set; } = string.Empty;
    public string DireccionCliente { get; set; } = string.Empty;
    public string CiudadCliente { get; set; } = string.Empty;
    public string DistritoCliente { get; set; } = string.Empty;
    public string? ReferenciaCliente { get; set; }
    
    public decimal Subtotal { get; set; }
    public decimal CostoEnvio { get; set; }
    public decimal Total { get; set; }
    
    public string MetodoPago { get; set; } = string.Empty;
    public string EstadoPago { get; set; } = string.Empty;
    public string EstadoPedido { get; set; } = string.Empty;
    public string? UrlComprobantePago { get; set; }
    public string? NotasAdmin { get; set; }
    
    public string TipoComprobante { get; set; } = string.Empty;
    public string? NombreEmpresa { get; set; }
    public string? RucEmpresa { get; set; }
    
    public DateTime FechaPedido { get; set; }
    public DateTime? FechaEntrega { get; set; }
    
    public List<RespuestaDetallePedidoDto> Items { get; set; } = new();
}

public class RespuestaDetallePedidoDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string CodigoProducto { get; set; } = string.Empty;
    public string? TallaProducto { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class ActualizarEstadoPedidoDto
{
    public string EstadoPedido { get; set; } = string.Empty;
    public string? EstadoPago { get; set; }
    public string? NotasAdmin { get; set; }
}

public class FiltroPedidoDto
{
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string? EstadoPedido { get; set; }
    public string? EstadoPago { get; set; }
    public string? MetodoPago { get; set; }
    public string? TerminoBusqueda { get; set; }
}
