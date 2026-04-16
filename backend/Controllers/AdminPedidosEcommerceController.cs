using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Services;

namespace NobleStep.Api.Controllers;

[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/admin/ecommerce-orders")]
public class AdminPedidosEcommerceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AdminPedidosEcommerceController> _logger;
    private readonly IServicioCorreo _servicioCorreo;

    public AdminPedidosEcommerceController(
        AppDbContext context,
        ILogger<AdminPedidosEcommerceController> logger,
        IServicioCorreo servicioCorreo)
    {
        _context = context;
        _logger = logger;
        _servicioCorreo = servicioCorreo;
    }

    // GET: api/admin/ecommerce-orders
    [HttpGet]
    public async Task<ActionResult<List<RespuestaPedidoDto>>> GetTodosPedidos(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null,
        [FromQuery] string? paymentStatus = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            var query = _context.Pedidos
                .Include(o => o.DetallesPedido)
                .ThenInclude(od => od.Producto)
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(o => o.FechaPedido >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(o => o.FechaPedido <= endDate.Value.AddDays(1));

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(o => o.EstadoPedido == status);

            if (!string.IsNullOrWhiteSpace(paymentStatus))
                query = query.Where(o => o.EstadoPago == paymentStatus);

            if (!string.IsNullOrWhiteSpace(paymentMethod))
                query = query.Where(o => o.MetodoPago == paymentMethod);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(o =>
                    o.NumeroPedido.Contains(searchTerm) ||
                    o.NombreCompletoCliente.Contains(searchTerm) ||
                    o.CorreoCliente.Contains(searchTerm) ||
                    o.TelefonoCliente.Contains(searchTerm));
            }

            var pedidos = await query
                .OrderByDescending(o => o.FechaPedido)
                .ToListAsync();

            var response = pedidos.Select(pedido => new RespuestaPedidoDto
            {
                Id = pedido.Id,
                NumeroPedido = pedido.NumeroPedido,
                NombreCompletoCliente = pedido.NombreCompletoCliente,
                CorreoCliente = pedido.CorreoCliente,
                TelefonoCliente = pedido.TelefonoCliente,
                DireccionCliente = pedido.DireccionCliente,
                CiudadCliente = pedido.CiudadCliente,
                DistritoCliente = pedido.DistritoCliente,
                ReferenciaCliente = pedido.ReferenciaCliente,
                Subtotal = pedido.Subtotal,
                CostoEnvio = pedido.CostoEnvio,
                Total = pedido.Total,
                MetodoPago = pedido.MetodoPago,
                EstadoPago = pedido.EstadoPago,
                EstadoPedido = pedido.EstadoPedido,
                UrlComprobantePago = pedido.UrlComprobantePago,
                NotasAdmin = pedido.NotasAdmin,
                TipoComprobante = pedido.TipoComprobante,
                NombreEmpresa = pedido.RazonSocialEmpresa,
                RucEmpresa = pedido.RucEmpresa,
                FechaPedido = pedido.FechaPedido,
                FechaEntrega = pedido.FechaEntregado,
                Items = pedido.DetallesPedido.Select(od => new RespuestaDetallePedidoDto
                {
                    Id = od.Id,
                    ProductoId = od.ProductoId,
                    NombreProducto = od.NombreProducto,
                    CodigoProducto = od.CodigoProducto,
                    TallaProducto = od.TallaProducto,
                    Cantidad = od.Cantidad,
                    PrecioUnitario = od.PrecioUnitario,
                    Subtotal = od.Subtotal
                }).ToList()
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo pedidos del e-commerce");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // PUT: api/admin/ecommerce-orders/{id}/status
    [HttpPut("{id}/status")]
    public async Task<ActionResult> ActualizarEstadoPedido(int id, [FromBody] ActualizarEstadoPedidoDto dto)
    {
        try
        {
            var pedido = await _context.Pedidos.FindAsync(id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido no encontrado" });
            }

            if (!string.IsNullOrWhiteSpace(dto.EstadoPedido))
            {
                pedido.EstadoPedido = dto.EstadoPedido;

                if (dto.EstadoPedido == Helpers.EstadoPedido.EnProceso && pedido.FechaProcesado == null)
                {
                    pedido.FechaProcesado = DateTime.UtcNow;
                }
                else if (dto.EstadoPedido == Helpers.EstadoPedido.Enviado && pedido.FechaEnviado == null)
                {
                    pedido.FechaEnviado = DateTime.UtcNow;
                }
                else if (dto.EstadoPedido == Helpers.EstadoPedido.Entregado && pedido.FechaEntregado == null)
                {
                    pedido.FechaEntregado = DateTime.UtcNow;
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.EstadoPago))
            {
                pedido.EstadoPago = dto.EstadoPago;
            }

            if (!string.IsNullOrWhiteSpace(dto.NotasAdmin))
            {
                pedido.NotasAdmin = dto.NotasAdmin;
            }

            pedido.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Enviar email de notificación al cliente
            try
            {
                await _servicioCorreo.EnviarCorreoActualizacionEstadoPedidoAsync(
                    pedido.CorreoCliente,
                    pedido.NumeroPedido,
                    pedido.NombreCompletoCliente,
                    pedido.EstadoPedido);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "No se pudo enviar email de actualización para {NumeroPedido}", pedido.NumeroPedido);
            }

            _logger.LogInformation("Pedido {NumeroPedido} actualizado", pedido.NumeroPedido);
            return Ok(new { message = "Pedido actualizado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error actualizando pedido {PedidoId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/admin/ecommerce-orders/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<RespuestaPedidoDto>> GetPedidoPorId(int id)
    {
        try
        {
            var pedido = await _context.Pedidos
                .Include(o => o.DetallesPedido)
                .ThenInclude(od => od.Producto)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido no encontrado" });
            }

            var response = new RespuestaPedidoDto
            {
                Id = pedido.Id,
                NumeroPedido = pedido.NumeroPedido,
                NombreCompletoCliente = pedido.NombreCompletoCliente,
                CorreoCliente = pedido.CorreoCliente,
                TelefonoCliente = pedido.TelefonoCliente,
                DireccionCliente = pedido.DireccionCliente,
                CiudadCliente = pedido.CiudadCliente,
                DistritoCliente = pedido.DistritoCliente,
                ReferenciaCliente = pedido.ReferenciaCliente,
                Subtotal = pedido.Subtotal,
                CostoEnvio = pedido.CostoEnvio,
                Total = pedido.Total,
                MetodoPago = pedido.MetodoPago,
                EstadoPago = pedido.EstadoPago,
                EstadoPedido = pedido.EstadoPedido,
                UrlComprobantePago = pedido.UrlComprobantePago,
                NotasAdmin = pedido.NotasAdmin,
                TipoComprobante = pedido.TipoComprobante,
                NombreEmpresa = pedido.RazonSocialEmpresa,
                RucEmpresa = pedido.RucEmpresa,
                FechaPedido = pedido.FechaPedido,
                FechaEntrega = pedido.FechaEntregado,
                Items = pedido.DetallesPedido.Select(od => new RespuestaDetallePedidoDto
                {
                    Id = od.Id,
                    ProductoId = od.ProductoId,
                    NombreProducto = od.NombreProducto,
                    CodigoProducto = od.CodigoProducto,
                    TallaProducto = od.TallaProducto,
                    Cantidad = od.Cantidad,
                    PrecioUnitario = od.PrecioUnitario,
                    Subtotal = od.Subtotal
                }).ToList()
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo pedido {PedidoId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/admin/ecommerce-orders/{id}/receipt
    [HttpGet("{id}/receipt")]
    public async Task<IActionResult> GetBoletaPedidoAdmin(int id, [FromQuery] bool download = false)
    {
        try
        {
            var pedido = await _context.Pedidos
                .Include(o => o.DetallesPedido)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (pedido == null)
                return NotFound(new { message = "Pedido no encontrado" });

            var filePath = BoletaHelper.GenerarBoletaPedido(pedido);
            var fileName = Path.GetFileName(filePath);
            var bytes = await System.IO.File.ReadAllBytesAsync(filePath);

            if (download)
                return File(bytes, "text/plain; charset=utf-8", fileName);

            Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
            return File(bytes, "text/plain; charset=utf-8");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo boleta de pedido admin {PedidoId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/admin/ecommerce-orders/export
    [HttpGet("export")]
    public async Task<ActionResult> ExportarPedidos(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.Pedidos
                .Include(o => o.DetallesPedido)
                .ThenInclude(od => od.Producto)
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(o => o.FechaPedido >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(o => o.FechaPedido <= endDate.Value.AddDays(1));

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(o => o.EstadoPedido == status);

            var pedidos = await query.OrderByDescending(o => o.FechaPedido).ToListAsync();

            // Generar CSV con sanitización contra CSV Injection
            static string SanitizeCsvCell(string? value)
            {
                if (string.IsNullOrEmpty(value)) return string.Empty;
                var trimmed = value.Trim();
                return (trimmed.StartsWith('=') || trimmed.StartsWith('+') ||
                        trimmed.StartsWith('-') || trimmed.StartsWith('@'))
                    ? "'" + trimmed
                    : trimmed;
            }

            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Número,Fecha,Cliente,Email,Teléfono,Total,Método Pago,Estado Pago,Estado Pedido");

            foreach (var pedido in pedidos)
            {
                csv.AppendLine(string.Join(",",
                    $"\"{SanitizeCsvCell(pedido.NumeroPedido)}\"",
                    $"\"{pedido.FechaPedido:yyyy-MM-dd HH:mm}\"",
                    $"\"{SanitizeCsvCell(pedido.NombreCompletoCliente)}\"",
                    $"\"{SanitizeCsvCell(pedido.CorreoCliente)}\"",
                    $"\"{SanitizeCsvCell(pedido.TelefonoCliente)}\"",
                    $"\"{pedido.Total:F2}\"",
                    $"\"{SanitizeCsvCell(pedido.MetodoPago)}\"",
                    $"\"{SanitizeCsvCell(pedido.EstadoPago)}\"",
                    $"\"{SanitizeCsvCell(pedido.EstadoPedido)}\""
                ));
            }

            var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"orders_{DateTime.UtcNow:yyyyMMdd}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exportando pedidos");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
