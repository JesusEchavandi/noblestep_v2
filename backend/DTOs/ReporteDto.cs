namespace NobleStep.Api.DTOs;

// Reportes de Ventas
public class ReporteVentasDto
{
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public List<ItemReporteVentasDto> Items { get; set; } = new();
    public decimal TotalVentas { get; set; }
    public int TotalTransacciones { get; set; }
    public decimal TicketPromedio { get; set; }
}

public class ItemReporteVentasDto
{
    public int VentaId { get; set; }
    public DateTime FechaVenta { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string DocumentoCliente { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int CantidadItems { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
}

public class ReporteVentasPorProductoDto
{
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string NombreCategoria { get; set; } = string.Empty;
    public int CantidadTotalVendida { get; set; }
    public decimal IngresosTotales { get; set; }
    public decimal PrecioPromedio { get; set; }
}

public class ReporteVentasPorClienteDto
{
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public int TotalCompras { get; set; }
    public decimal TotalGastado { get; set; }
    public decimal TicketPromedio { get; set; }
    public DateTime UltimaFechaCompra { get; set; }
}

// Reportes de Compras
public class ReporteComprasDto
{
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public List<ItemReporteComprasDto> Items { get; set; } = new();
    public decimal TotalCompras { get; set; }
    public int TotalTransacciones { get; set; }
}

public class ItemReporteComprasDto
{
    public int CompraId { get; set; }
    public DateTime FechaCompra { get; set; }
    public string NombreProveedor { get; set; } = string.Empty;
    public string DocumentoProveedor { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int CantidadItems { get; set; }
    public string Estado { get; set; } = string.Empty;
}

public class ReporteComprasPorProveedorDto
{
    public int ProveedorId { get; set; }
    public string NombreProveedor { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public int TotalCompras { get; set; }
    public decimal TotalGastado { get; set; }
    public DateTime UltimaFechaCompra { get; set; }
}

// Reportes de Inventario
public class ReporteInventarioDto
{
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Talla { get; set; } = string.Empty;
    public string NombreCategoria { get; set; } = string.Empty;
    public int StockActual { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal ValorTotal { get; set; }
    public int TotalVendido { get; set; }
    public decimal TasaRotacion { get; set; }
}

// Valuación de Inventario
public class ValuacionInventarioDto
{
    public decimal ValorTotal { get; set; }
    public int TotalUnidades { get; set; }
    public int TotalProductos { get; set; }
    public List<ValuacionCategoriaDto> PorCategoria { get; set; } = new();
}

public class ValuacionCategoriaDto
{
    public string Categoria { get; set; } = string.Empty;
    public decimal ValorTotal { get; set; }
    public int TotalUnidades { get; set; }
    public int Productos { get; set; }
}

// Reporte de Ganancia/Pérdida
public class ReporteGananciaPerdidaDto
{
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public decimal TotalVentas { get; set; }
    public decimal TotalCompras { get; set; }
    public decimal GananciaBruta { get; set; }
    public decimal MargenGanancia { get; set; }
    public int ProductosVendidos { get; set; }
    public int ProductosComprados { get; set; }
}

// Reporte de Productos Top
public class ReporteProductosTopDto
{
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public List<ItemProductoTopDto> TopPorIngresos { get; set; } = new();
    public List<ItemProductoTopDto> TopPorCantidad { get; set; } = new();
}

public class ItemProductoTopDto
{
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string NombreCategoria { get; set; } = string.Empty;
    public int CantidadVendida { get; set; }
    public decimal Ingresos { get; set; }
}
