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
[Route("api/ecommerce/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        AppDbContext context,
        IEmailService emailService,
        ILogger<OrdersController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    // POST: api/ecommerce/orders
    [HttpPost]
    [EnableRateLimiting("create-order")]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Validaciones básicas
            if (string.IsNullOrWhiteSpace(dto.CustomerFullName) || 
                string.IsNullOrWhiteSpace(dto.CustomerEmail) ||
                string.IsNullOrWhiteSpace(dto.CustomerPhone) ||
                dto.Items == null || !dto.Items.Any())
            {
                return BadRequest(new { message = "Faltan datos requeridos" });
            }

            // Obtener ID de cliente si está autenticado
            int? customerId = null;
            var customerIdClaim = User.FindFirst("customerId");
            if (customerIdClaim != null && int.TryParse(customerIdClaim.Value, out var id))
            {
                customerId = id;
            }

            // Calcular totales
            decimal subtotal = 0;
            var orderDetails = new List<OrderDetail>();

            // Obtener todos los productIds y variantIds de una sola vez (evitar N+1)
            var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
            var variantIds = dto.Items.Where(i => i.VariantId.HasValue)
                                      .Select(i => i.VariantId!.Value).Distinct().ToList();

            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id) && p.IsActive)
                .ToListAsync();

            var variants = variantIds.Any()
                ? await _context.ProductVariants
                    .Where(v => variantIds.Contains(v.Id) && v.IsActive)
                    .ToListAsync()
                : new List<ProductVariant>();

            foreach (var item in dto.Items)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Producto {item.ProductId} no encontrado o inactivo" });

                string sizeSnapshot;

                if (item.VariantId.HasValue)
                {
                    // ── Modo con variantes: descontar stock de la talla específica ──
                    var variant = variants.FirstOrDefault(v => v.Id == item.VariantId.Value);
                    if (variant == null)
                        return BadRequest(new { message = $"Talla no encontrada (VariantId {item.VariantId})" });

                    if (variant.ProductId != item.ProductId)
                        return BadRequest(new { message = $"La variante {item.VariantId} no pertenece al producto {item.ProductId}" });

                    if (variant.Stock < item.Quantity)
                        return BadRequest(new { message = $"Stock insuficiente para {product.Name} talla {variant.Size} (disponible: {variant.Stock})" });

                    variant.Stock -= item.Quantity;
                    variant.UpdatedAt = DateTime.UtcNow;
                    sizeSnapshot = variant.Size;
                }
                else
                {
                    // ── Modo legacy: descontar del Stock del producto directamente ──
                    if (product.Stock < item.Quantity)
                        return BadRequest(new { message = $"Stock insuficiente para {product.Name} (disponible: {product.Stock})" });

                    product.Stock -= item.Quantity;
                    sizeSnapshot = product.Size;
                }

                product.UpdatedAt = DateTime.UtcNow;

                // SEGURIDAD: El precio siempre se calcula desde la BD.
                // Se usa SalePrice si está activo (> 0), sino Price.
                // El cliente NUNCA puede manipular el precio desde el frontend.
                var unitPrice = (product.SalePrice > 0) ? product.SalePrice : product.Price;
                var itemSubtotal = unitPrice * item.Quantity;
                subtotal += itemSubtotal;

                orderDetails.Add(new OrderDetail
                {
                    ProductId    = item.ProductId,
                    ProductName  = product.Name,
                    ProductCode  = product.Brand,
                    ProductSize  = sizeSnapshot,
                    ProductBrand = product.Brand,
                    Quantity     = item.Quantity,
                    UnitPrice    = unitPrice,
                    Subtotal     = itemSubtotal
                });
            }

            // Calcular envío
            decimal shippingCost = subtotal >= 100 ? 0 : 10;
            decimal total = subtotal + shippingCost;

            // Generar número de orden
            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";

            // Crear orden
            var order = new Order
            {
                EcommerceCustomerId = customerId,
                OrderNumber = orderNumber,
                CustomerFullName = dto.CustomerFullName,
                CustomerEmail = dto.CustomerEmail,
                CustomerPhone = dto.CustomerPhone,
                CustomerAddress = dto.CustomerAddress,
                CustomerCity = dto.CustomerCity,
                CustomerDistrict = dto.CustomerDistrict,
                CustomerReference = dto.CustomerReference,
                CustomerDocumentNumber = dto.CustomerDocumentNumber,
                Subtotal = subtotal,
                ShippingCost = shippingCost,
                Total = total,
                PaymentMethod = dto.PaymentMethod,
                PaymentDetails = dto.PaymentDetails,
                PaymentStatus = "Pending",
                OrderStatus = "Pending",
                InvoiceType = dto.InvoiceType,
                CompanyName = dto.CompanyName,
                CompanyRUC = dto.CompanyRUC,
                CompanyAddress = dto.CompanyAddress,
                OrderDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                OrderDetails = orderDetails
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Enviar email de confirmación (no bloqueante)
            try
            {
                var emailItems = order.OrderDetails.Select(od => new OrderDetailResponseDto
                {
                    Id = od.Id,
                    ProductId = od.ProductId,
                    ProductName = od.ProductName,
                    ProductCode = od.ProductCode,
                    ProductSize = od.ProductSize,
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Subtotal
                }).ToList();

                await _emailService.SendOrderConfirmationEmailAsync(
                    order.CustomerEmail,
                    order.OrderNumber,
                    order.CustomerFullName,
                    order.Total,
                    emailItems);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo enviar email de confirmación para orden {OrderNumber}", orderNumber);
            }

            // Preparar respuesta
            var response = MapOrderToDto(order);

            _logger.LogInformation("Orden creada: {OrderNumber}", orderNumber);
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
    public async Task<ActionResult<List<OrderResponseDto>>> GetMyOrders()
    {
        try
        {
            var customerIdClaim = User.FindFirst("customerId");
            if (customerIdClaim == null || !int.TryParse(customerIdClaim.Value, out var customerId))
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Where(o => o.EcommerceCustomerId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var response = orders.Select(MapOrderToDto).ToList();

            return Ok(response);
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
    public async Task<ActionResult<OrderResponseDto>> GetOrder(int id)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Orden no encontrada" });
            }

            // Verificar ownership: el cliente autenticado solo puede ver sus propias órdenes
            var customerIdClaim = User.FindFirst("customerId");
            if (customerIdClaim == null || !int.TryParse(customerIdClaim.Value, out var customerId))
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            if (order.EcommerceCustomerId != customerId)
            {
                return Forbid();
            }

            var response = MapOrderToDto(order);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo orden {OrderId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    private OrderResponseDto MapOrderToDto(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerFullName = order.CustomerFullName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            CustomerAddress = order.CustomerAddress,
            CustomerCity = order.CustomerCity,
            CustomerDistrict = order.CustomerDistrict,
            CustomerReference = order.CustomerReference,
            Subtotal = order.Subtotal,
            ShippingCost = order.ShippingCost,
            Total = order.Total,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            OrderStatus = order.OrderStatus,
            InvoiceType = order.InvoiceType,
            CompanyName = order.CompanyName,
            CompanyRUC = order.CompanyRUC,
            OrderDate = order.OrderDate,
            DeliveredDate = order.DeliveredDate,
            Items = order.OrderDetails.Select(od => new OrderDetailResponseDto
            {
                Id = od.Id,
                ProductId = od.ProductId,
                ProductName = od.ProductName,
                ProductCode = od.ProductCode,
                ProductSize = od.ProductSize,
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                Subtotal = od.Subtotal
            }).ToList()
        };
    }
}
