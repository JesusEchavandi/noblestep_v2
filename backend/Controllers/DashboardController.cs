using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using System.Globalization;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator,Seller")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(AppDbContext context, ILogger<DashboardController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<DashboardMetricsDto>> GetDashboardMetrics()
    {
        try
        {
            var now = DateTime.UtcNow;
            
            // Total sales - Simple query
            var totalSales = await _context.Sales
                .Where(s => s.Status == "Completed")
                .SumAsync(s => (decimal?)s.Total) ?? 0;
            
            var totalSalesCount = await _context.Sales
                .Where(s => s.Status == "Completed")
                .CountAsync();

            // Today's sales
            var todayStart = now.Date;
            var tomorrowStart = todayStart.AddDays(1);
            
            var todaySales = await _context.Sales
                .Where(s => s.Status == "Completed" && s.SaleDate >= todayStart && s.SaleDate < tomorrowStart)
                .SumAsync(s => (decimal?)s.Total) ?? 0;
            
            var todaySalesCount = await _context.Sales
                .Where(s => s.Status == "Completed" && s.SaleDate >= todayStart && s.SaleDate < tomorrowStart)
                .CountAsync();

            // This month's sales
            var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
            var monthSales = await _context.Sales
                .Where(s => s.Status == "Completed" && s.SaleDate >= firstDayOfMonth)
                .SumAsync(s => (decimal?)s.Total) ?? 0;
            
            var monthSalesCount = await _context.Sales
                .Where(s => s.Status == "Completed" && s.SaleDate >= firstDayOfMonth)
                .CountAsync();

            // Products
            var totalProducts = await _context.Products.CountAsync();
            var activeProducts = await _context.Products.Where(p => p.IsActive).CountAsync();
            var lowStockProducts = await _context.Products.Where(p => p.IsActive && p.Stock < 10).CountAsync();

            // Customers
            var totalCustomers = await _context.Customers.CountAsync();

            // Suppliers
            var totalSuppliers = await _context.Suppliers.Where(s => s.IsActive).CountAsync();

            // Purchases
            var totalPurchases = await _context.Purchases.SumAsync(p => (decimal?)p.Total) ?? 0;
            var totalPurchasesCount = await _context.Purchases.CountAsync();

            // Average sale amount
            var averageSaleAmount = totalSalesCount > 0 ? totalSales / totalSalesCount : 0;

            var metrics = new DashboardMetricsDto
            {
                TotalSales = totalSales,
                TotalSalesCount = totalSalesCount,
                TodaySales = todaySales,
                TodaySalesCount = todaySalesCount,
                MonthSales = monthSales,
                MonthSalesCount = monthSalesCount,
                TotalProducts = totalProducts,
                ActiveProducts = activeProducts,
                LowStockProducts = lowStockProducts,
                TotalCustomers = totalCustomers,
                TotalSuppliers = totalSuppliers,
                TotalPurchases = totalPurchases,
                TotalPurchasesCount = totalPurchasesCount,
                AverageSaleAmount = averageSaleAmount
            };

            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en GetDashboardMetrics");
            return StatusCode(500, new { message = "Error al obtener métricas del dashboard" });
        }
    }

    [HttpGet("sales-chart")]
    public async Task<ActionResult<SalesChartDataDto>> GetSalesChartData()
    {
        try
        {
            var now = DateTime.UtcNow;
            var last7DaysStart = now.Date.AddDays(-6);
        var last6MonthsStart = now.Date.AddMonths(-5).AddDays(1 - now.Day);

        // Last 7 days
        var salesLast7Days = await _context.Sales
            .Where(s => s.Status == "Completed" && s.SaleDate >= last7DaysStart)
            .ToListAsync();

        var dailySales = new List<DailySalesDto>();
        for (int i = 6; i >= 0; i--)
        {
            var date = now.Date.AddDays(-i);
            var daySales = salesLast7Days.Where(s => s.SaleDate.Date == date);
            dailySales.Add(new DailySalesDto
            {
                Date = date,
                Total = daySales.Sum(s => s.Total),
                Count = daySales.Count()
            });
        }

        // Last 6 months
        var salesLast6Months = await _context.Sales
            .Where(s => s.Status == "Completed" && s.SaleDate >= last6MonthsStart)
            .ToListAsync();

        var monthlySales = new List<MonthlySalesDto>();
        var culture = new CultureInfo("es-ES");
        
        for (int i = 5; i >= 0; i--)
        {
            var monthDate = now.AddMonths(-i);
            var year = monthDate.Year;
            var month = monthDate.Month;
            var monthStart = new DateTime(year, month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            var monthSalesData = salesLast6Months
                .Where(s => s.SaleDate.Year == year && s.SaleDate.Month == month);

            monthlySales.Add(new MonthlySalesDto
            {
                Year = year,
                Month = month,
                MonthName = culture.DateTimeFormat.GetMonthName(month),
                Total = monthSalesData.Sum(s => s.Total),
                Count = monthSalesData.Count()
            });
        }

            var chartData = new SalesChartDataDto
            {
                Last7Days = dailySales,
                Last6Months = monthlySales
            };

            return Ok(chartData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en GetSalesChartData");
            return StatusCode(500, new { message = "Error al obtener datos de gráficas" });
        }
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<IEnumerable<TopProductDto>>> GetTopProducts([FromQuery] int limit = 5)
    {
        var topProducts = await _context.SaleDetails
            .Include(sd => sd.Product)
            .Where(sd => sd.Product.IsActive)
            .GroupBy(sd => new { sd.ProductId, sd.Product.Name, sd.Product.Brand })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                Brand = g.Key.Brand,
                TotalQuantitySold = g.Sum(sd => sd.Quantity),
                TotalRevenue = g.Sum(sd => sd.Subtotal)
            })
            .OrderByDescending(x => x.TotalRevenue)
            .Take(limit)
            .ToListAsync();

        return Ok(topProducts);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<LowStockProductDto>>> GetLowStockProducts([FromQuery] int threshold = 10)
    {
        var lowStockProducts = await _context.Products
            .Where(p => p.IsActive && p.Stock < threshold)
            .OrderBy(p => p.Stock)
            .Select(p => new LowStockProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Brand = p.Brand,
                Size = p.Size,
                Stock = p.Stock,
                Price = p.Price
            })
            .ToListAsync();

        return Ok(lowStockProducts);
    }

    [HttpGet("recent-sales")]
    public async Task<ActionResult<IEnumerable<RecentSaleDto>>> GetRecentSales([FromQuery] int limit = 10)
    {
        var recentSales = await _context.Sales
            .Include(s => s.Customer)
            .Include(s => s.SaleDetails)
            .OrderByDescending(s => s.SaleDate)
            .Take(limit)
            .Select(s => new RecentSaleDto
            {
                Id = s.Id,
                SaleDate = s.SaleDate,
                CustomerName = s.Customer.FullName,
                Total = s.Total,
                Status = s.Status,
                ItemsCount = s.SaleDetails.Count
            })
            .ToListAsync();

        return Ok(recentSales);
    }
}
