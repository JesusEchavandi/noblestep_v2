using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;
using NobleStep.Api.Services;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/ecommerce/orders")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IServicioCorreo _servicioCorreo;
    private readonly ILogger<PedidosController> _logger;

    public PedidosController(
        AppDbContext context,
        IServicioCorreo servicioCorreo,
        ILogger<PedidosController> logger)
    {
        _context = context;
        _servicioCorreo = servicioCorreo;
        _logger = logger;
    }

    // POST: api/ecommerce/orders
    [HttpPost]
    [EnableRateLimiting("create-order")]
    public async Task<ActionResult<RespuestaPedidoDto>> CrearPedido([FromBody] CrearPedidoDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Validaciones básicas
            if (string.IsNullOrWhiteSpace(dto.NombreCompletoCliente) ||
                string.IsNullOrWhiteSpace(dto.CorreoCliente) ||
                string.IsNullOrWhiteSpace(dto.TelefonoCliente) ||
                dto.Items == null || !dto.Items.Any())
            {
                return BadRequest(new { message = "Faltan datos requeridos" });
            }

            // Obtener ID de cliente si está autenticado
            int? clienteId = null;
            var clienteIdClaim = User.FindFirst("customerId");
            if (clienteIdClaim != null && int.TryParse(clienteIdClaim.Value, out var id))
            {
                clienteId = id;
            }

            // Calcular totales
            decimal subtotal = 0;
            var detallesPedido = new List<DetallePedido>();

            // Obtener todos los productIds y variantIds de una sola vez
            var productIds = dto.Items.Select(i => i.ProductoId).Distinct().ToList();
            var variantIds = dto.Items.Where(i => i.VarianteId.HasValue)
                                      .Select(i => i.VarianteId!.Value).Distinct().ToList();

            var productos = await _context.Productos
                .Where(p => productIds.Contains(p.Id) && p.Activo)
                .ToListAsync();

            var variantes = variantIds.Any()
                ? await _context.VariantesProducto
                    .Where(v => variantIds.Contains(v.Id) && v.Activo)
                    .ToListAsync()
                : new List<VarianteProducto>();

            foreach (var item in dto.Items)
            {
                var producto = productos.FirstOrDefault(p => p.Id == item.ProductoId);
                if (producto == null)
                    return BadRequest(new { message = $"Producto {item.ProductoId} no encontrado o inactivo" });

                string tallaSnapshot;

                if (item.VarianteId.HasValue)
                {
                    var variante = variantes.FirstOrDefault(v => v.Id == item.VarianteId.Value);
                    if (variante == null)
                        return BadRequest(new { message = $"Talla no encontrada (VariantId {item.VarianteId})" });

                    if (variante.ProductoId != item.ProductoId)
                        return BadRequest(new { message = $"La variante {item.VarianteId} no pertenece al producto {item.ProductoId}" });

                    if (variante.Stock < item.Cantidad)
                        return BadRequest(new { message = $"Stock insuficiente para {producto.Nombre} talla {variante.Talla} (disponible: {variante.Stock})" });

                    variante.Stock -= item.Cantidad;
                    variante.FechaActualizacion = DateTime.UtcNow;
                    tallaSnapshot = variante.Talla;
                }
                else
                {
                    if (producto.Stock < item.Cantidad)
                        return BadRequest(new { message = $"Stock insuficiente para {producto.Nombre} (disponible: {producto.Stock})" });

                    producto.Stock -= item.Cantidad;
                    tallaSnapshot = producto.Talla;
                }

                producto.FechaActualizacion = DateTime.UtcNow;

                var precioUnitario = (producto.PrecioOferta > 0) ? producto.PrecioOferta : producto.Precio;
                var subtotalItem = precioUnitario * item.Cantidad;
                subtotal += subtotalItem;

                detallesPedido.Add(new DetallePedido
                {
                    ProductoId = item.ProductoId,
                    NombreProducto = producto.Nombre,
                    CodigoProducto = producto.Marca,
                    TallaProducto = tallaSnapshot,
                    MarcaProducto = producto.Marca,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = precioUnitario,
                    Subtotal = subtotalItem
                });
            }

            // Calcular envío
            decimal costoEnvio = subtotal >= 100 ? 0 : 10;
            decimal total = subtotal + costoEnvio;

            // Generar número de orden
            var numeroPedido = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";

            // Crear pedido
            var pedido = new Pedido
            {
                ClienteEcommerceId = clienteId,
                NumeroPedido = numeroPedido,
                NombreCompletoCliente = dto.NombreCompletoCliente,
                CorreoCliente = dto.CorreoCliente,
                TelefonoCliente = dto.TelefonoCliente,
                DireccionCliente = dto.DireccionCliente,
                CiudadCliente = dto.CiudadCliente,
                DistritoCliente = dto.DistritoCliente,
                ReferenciaCliente = dto.ReferenciaCliente,
                DocumentoCliente = dto.NumeroDocumentoCliente,
                Subtotal = subtotal,
                CostoEnvio = costoEnvio,
                Total = total,
                MetodoPago = dto.MetodoPago,
                DetallePago = dto.DetallesPago,
                EstadoPago = Helpers.EstadoPago.Pendiente,
                EstadoPedido = Helpers.EstadoPedido.Pendiente,
                TipoComprobante = dto.TipoComprobante,
                RazonSocialEmpresa = dto.NombreEmpresa,
                RucEmpresa = dto.RucEmpresa,
                DireccionEmpresa = dto.DireccionEmpresa,
                FechaPedido = DateTime.UtcNow,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow,
                DetallesPedido = detallesPedido
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Enviar email de confirmación (no bloqueante)
            try
            {
                var emailItems = pedido.DetallesPedido.Select(od => new RespuestaDetallePedidoDto
                {
                    Id = od.Id,
                    ProductoId = od.ProductoId,
                    NombreProducto = od.NombreProducto,
                    CodigoProducto = od.CodigoProducto,
                    TallaProducto = od.TallaProducto,
                    Cantidad = od.Cantidad,
                    PrecioUnitario = od.PrecioUnitario,
                    Subtotal = od.Subtotal
                }).ToList();

                await _servicioCorreo.EnviarCorreoConfirmacionPedidoAsync(
                    pedido.CorreoCliente,
                    pedido.NumeroPedido,
                    pedido.NombreCompletoCliente,
                    pedido.Total,
                    emailItems);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo enviar email de confirmación para orden {NumeroPedido}", numeroPedido);
            }

            // Preparar respuesta
            var response = MapearPedidoADto(pedido);

            _logger.LogInformation("Orden creada: {NumeroPedido}", numeroPedido);
            return Ok(response);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            _logger.LogWarning("Race condition detectada al crear orden — stock modificado concurrentemente");
            return Conflict(new { message = "El stock de uno o más productos cambió durante el proceso. Por favor intenta de nuevo." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creando orden");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/ecommerce/orders/my-orders
    [Authorize]
    [HttpGet("my-orders")]
    public async Task<ActionResult<List<RespuestaPedidoDto>>> GetMisPedidos(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (pageSize > 50) pageSize = 50;
            if (pageSize < 1) pageSize = 1;
            if (page < 1) page = 1;

            var clienteIdClaim = User.FindFirst("customerId");
            if (clienteIdClaim == null || !int.TryParse(clienteIdClaim.Value, out var clienteId))
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            var query = _context.Pedidos
                .Include(o => o.DetallesPedido)
                .ThenInclude(od => od.Producto)
                .Where(o => o.ClienteEcommerceId == clienteId)
                .OrderByDescending(o => o.FechaPedido);

            var total = await _context.Pedidos
                .Where(o => o.ClienteEcommerceId == clienteId)
                .CountAsync();

            var pedidos = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = pedidos.Select(MapearPedidoADto).ToList();

            return Ok(new
            {
                datos = response,
                pagina = page,
                tamanoPagina = pageSize,
                total,
                totalPaginas = (int)Math.Ceiling((double)total / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo órdenes del cliente");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/ecommerce/orders/{id}
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<RespuestaPedidoDto>> GetPedido(int id)
    {
        try
        {
            var pedido = await _context.Pedidos
                .Include(o => o.DetallesPedido)
                .ThenInclude(od => od.Producto)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (pedido == null)
            {
                return NotFound(new { message = "Orden no encontrada" });
            }

            var clienteIdClaim = User.FindFirst("customerId");
            if (clienteIdClaim == null || !int.TryParse(clienteIdClaim.Value, out var clienteId))
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            if (pedido.ClienteEcommerceId != clienteId)
            {
                return Forbid();
            }

            var response = MapearPedidoADto(pedido);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo orden {PedidoId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    private RespuestaPedidoDto MapearPedidoADto(Pedido pedido)
    {
        return new RespuestaPedidoDto
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
    }
}
