using System.Text;
using NobleStep.Api.Models;

namespace NobleStep.Api.Helpers;

public static class BoletaHelper
{
    private static string ObtenerDirectorioBoletas()
    {
        var configuredPath = Environment.GetEnvironmentVariable("NOBLESTEP_RECEIPTS_PATH");
        var receiptsPath = string.IsNullOrWhiteSpace(configuredPath)
            ? Path.Combine(AppContext.BaseDirectory, "logs", "boletas")
            : configuredPath;

        Directory.CreateDirectory(receiptsPath);
        return receiptsPath;
    }

    public static string GenerarBoletaVenta(Venta venta)
    {
        var fechaPeru = DateTimeHelper.ConvertToPeruTime(venta.FechaVenta);
        var numeroBoleta = $"BOL-V-{venta.Id:D6}";

        var sb = new StringBuilder();
        sb.AppendLine("NOBLESTEP - BOLETA SIMPLE");
        sb.AppendLine($"Numero: {numeroBoleta}");
        sb.AppendLine($"Fecha: {fechaPeru:yyyy-MM-dd HH:mm:ss}");
        sb.AppendLine($"Cliente: {venta.Cliente?.NombreCompleto ?? "Cliente"}");
        sb.AppendLine($"Vendedor: {venta.Usuario?.NombreCompleto ?? venta.CreadoPor ?? "Usuario"}");
        sb.AppendLine(new string('-', 48));
        sb.AppendLine("DETALLE");

        foreach (var item in venta.DetallesVenta)
        {
            var nombreProducto = item.Producto?.Nombre ?? $"Producto #{item.ProductoId}";
            sb.AppendLine($"- {nombreProducto}");
            sb.AppendLine($"  Cant: {item.Cantidad}  P.Unit: {item.PrecioUnitario:F2}  Subt: {item.Subtotal:F2}");
        }

        sb.AppendLine(new string('-', 48));
        sb.AppendLine($"TOTAL: S/ {venta.Total:F2}");

        var fileName = $"venta-{venta.Id:D6}-{DateTime.UtcNow:yyyyMMddHHmmss}.txt";
        var filePath = Path.Combine(ObtenerDirectorioBoletas(), fileName);

        File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
        return filePath;
    }

    public static string GenerarBoletaPedido(Pedido pedido)
    {
        var fechaPeru = DateTimeHelper.ConvertToPeruTime(pedido.FechaPedido);
        var numeroBoleta = string.IsNullOrWhiteSpace(pedido.NumeroPedido)
            ? $"BOL-E-{pedido.Id:D6}"
            : $"BOL-E-{pedido.NumeroPedido}";

        var sb = new StringBuilder();
        sb.AppendLine("NOBLESTEP - BOLETA SIMPLE ECOMMERCE");
        sb.AppendLine($"Numero: {numeroBoleta}");
        sb.AppendLine($"Fecha: {fechaPeru:yyyy-MM-dd HH:mm:ss}");
        sb.AppendLine($"Cliente: {pedido.NombreCompletoCliente}");
        sb.AppendLine($"Documento: {pedido.DocumentoCliente ?? "-"}");
        sb.AppendLine($"Pago: {pedido.MetodoPago}");
        sb.AppendLine(new string('-', 48));
        sb.AppendLine("DETALLE");

        foreach (var item in pedido.DetallesPedido)
        {
            var talla = string.IsNullOrWhiteSpace(item.TallaProducto) ? "-" : item.TallaProducto;
            sb.AppendLine($"- {item.NombreProducto} (Talla: {talla})");
            sb.AppendLine($"  Cant: {item.Cantidad}  P.Unit: {item.PrecioUnitario:F2}  Subt: {item.Subtotal:F2}");
        }

        sb.AppendLine(new string('-', 48));
        sb.AppendLine($"Subtotal: S/ {pedido.Subtotal:F2}");
        sb.AppendLine($"Envio: S/ {pedido.CostoEnvio:F2}");
        sb.AppendLine($"TOTAL: S/ {pedido.Total:F2}");

        var safeOrder = string.IsNullOrWhiteSpace(pedido.NumeroPedido)
            ? $"pedido-{pedido.Id:D6}"
            : pedido.NumeroPedido.Replace("/", "-").Replace("\\", "-");

        var fileName = $"ecommerce-{safeOrder}-{DateTime.UtcNow:yyyyMMddHHmmss}.txt";
        var filePath = Path.Combine(ObtenerDirectorioBoletas(), fileName);

        File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
        return filePath;
    }
}
