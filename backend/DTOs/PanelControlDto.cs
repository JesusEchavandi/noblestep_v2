namespace NobleStep.Api.DTOs;

public class MetricasPanelDto
{
    public decimal TotalVentas { get; set; }
    public int CantidadTotalVentas { get; set; }
    public decimal VentasHoy { get; set; }
    public int CantidadVentasHoy { get; set; }
    public decimal VentasMes { get; set; }
    public int CantidadVentasMes { get; set; }
    public int TotalProductos { get; set; }
    public int ProductosActivos { get; set; }
    public int ProductosBajoStock { get; set; }
    public int TotalClientes { get; set; }
    public int TotalProveedores { get; set; }
    public decimal TotalCompras { get; set; }
    public int CantidadTotalCompras { get; set; }
    public decimal MontoPromedioVenta { get; set; }
}

public class DatosGraficoVentasDto
{
    public List<VentasDiariasDto> Ultimos7Dias { get; set; } = new();
    public List<VentasMensualesDto> Ultimos6Meses { get; set; } = new();
}

public class VentasDiariasDto
{
    public DateTime Fecha { get; set; }
    public decimal Total { get; set; }
    public int Cantidad { get; set; }
}

public class VentasMensualesDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string NombreMes { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int Cantidad { get; set; }
}

public class ProductoTopDto
{
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public int CantidadTotalVendida { get; set; }
    public decimal IngresosTotales { get; set; }
}

public class ProductoBajoStockDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Talla { get; set; } = string.Empty;
    public int Stock { get; set; }
    public decimal Precio { get; set; }
}

public class VentaRecienteDto
{
    public int Id { get; set; }
    public DateTime FechaVenta { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int CantidadItems { get; set; }
}
