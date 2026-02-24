using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Services;

namespace NobleStep.Api.Controllers;

[Authorize(Roles = "Administrator")]
[ApiController]
[Route("api/admin/ecommerce-orders")]
public class AdminEcommerceOrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AdminEcommerceOrdersController> _logger;
    private readonly IEmailService _emailService;

    public AdminEcommerceOrdersController(
        AppDbContext context,
        ILogger<AdminEcommerceOrdersController> logger,
        IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
    }

    // GET: api/admin/ecommerce-orders
    [HttpGet]
    public async Task<ActionResult<List<OrderResponseDto>>> GetAllOrders(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null,
        [FromQuery] string? paymentStatus = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            var query = _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= endDate.Value.AddDays(1));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.OrderStatus == status);
            }

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                query = query.Where(o => o.PaymentStatus == paymentStatus);
            }

            if (!string.IsNullOrWhiteSpace(paymentMethod))
            {
                query = query.Where(o => o.PaymentMethod == paymentMethod);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(o => 
                    o.OrderNumber.Contains(searchTerm) ||
                    o.CustomerFullName.Contains(searchTerm) ||
                    o.CustomerEmail.Contains(searchTerm) ||
                    o.CustomerPhone.Contains(searchTerm));
            }

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var response = orders.Select(order => new OrderResponseDto
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
                PaymentProofUrl = order.PaymentProofUrl,
                AdminNotes = order.AdminNotes,
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
    public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        try
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Pedido no encontrado" });
            }

            if (!string.IsNullOrWhiteSpace(dto.OrderStatus))
            {
                order.OrderStatus = dto.OrderStatus;

                // Actualizar fechas según el estado
                if (dto.OrderStatus == "Processing" && order.ProcessedDate == null)
                {
                    order.ProcessedDate = DateTime.UtcNow;
                }
                else if (dto.OrderStatus == "Shipped" && order.ShippedDate == null)
                {
                    order.ShippedDate = DateTime.UtcNow;
                }
                else if (dto.OrderStatus == "Delivered" && order.DeliveredDate == null)
                {
                    order.DeliveredDate = DateTime.UtcNow;
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.PaymentStatus))
            {
                order.PaymentStatus = dto.PaymentStatus;
            }

            if (!string.IsNullOrWhiteSpace(dto.AdminNotes))
            {
                order.AdminNotes = dto.AdminNotes;
            }

            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Enviar email de notificación al cliente
            try
            {
                await _emailService.SendOrderStatusUpdateEmailAsync(
                    order.CustomerEmail, 
                    order.OrderNumber, 
                    order.CustomerFullName, 
                    order.OrderStatus);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "No se pudo enviar email de actualización para {OrderNumber}", order.OrderNumber);
            }

            _logger.LogInformation("Pedido {OrderNumber} actualizado", order.OrderNumber);
            return Ok(new { message = "Pedido actualizado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error actualizando pedido {OrderId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/admin/ecommerce-orders/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponseDto>> GetOrderById(int id)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Pedido no encontrado" });
            }

            var response = new OrderResponseDto
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
                PaymentProofUrl = order.PaymentProofUrl,
                AdminNotes = order.AdminNotes,
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

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo pedido {OrderId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/admin/ecommerce-orders/export
    [HttpGet("export")]
    public async Task<ActionResult> ExportOrders(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= endDate.Value.AddDays(1));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.OrderStatus == status);
            }

            var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();

            // Generar CSV con sanitización contra CSV Injection
            // Celdas que comiencen con = + - @ se prefjian con comilla simple
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

            foreach (var order in orders)
            {
                csv.AppendLine(string.Join(",",
                    $"\"{ SanitizeCsvCell(order.OrderNumber)}\"",
                    $"\"{ order.OrderDate:yyyy-MM-dd HH:mm}\"",
                    $"\"{ SanitizeCsvCell(order.CustomerFullName)}\"",
                    $"\"{ SanitizeCsvCell(order.CustomerEmail)}\"",
                    $"\"{ SanitizeCsvCell(order.CustomerPhone)}\"",
                    $"\"{ order.Total:F2}\"",
                    $"\"{ SanitizeCsvCell(order.PaymentMethod)}\"",
                    $"\"{ SanitizeCsvCell(order.PaymentStatus)}\"",
                    $"\"{ SanitizeCsvCell(order.OrderStatus)}\""
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
