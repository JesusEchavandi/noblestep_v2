using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator,Seller")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    // Sales Reports
    [HttpGet("sales")]
    public async Task<ActionResult<SalesReportDto>> GetSalesReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var sales = await _context.Sales
            .Include(s => s.Customer)
            .Include(s => s.User)
            .Include(s => s.SaleDetails)
            .Where(s => s.Status == "Completed" && s.SaleDate >= start && s.SaleDate <= end)
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();

        var items = sales.Select(s => new SalesReportItemDto
        {
            SaleId = s.Id,
            SaleDate = s.SaleDate,
            CustomerName = s.Customer.FullName,
            CustomerDocument = s.Customer.DocumentNumber,
            Total = s.Total,
            ItemsCount = s.SaleDetails.Count,
            Status = s.Status,
            UserName = s.User.FullName
        }).ToList();

        var totalSales = sales.Sum(s => s.Total);
        var totalTransactions = sales.Count;
        var averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

        var report = new SalesReportDto
        {
            StartDate = start,
            EndDate = end,
            Items = items,
            TotalSales = totalSales,
            TotalTransactions = totalTransactions,
            AverageTicket = averageTicket
        };

        return Ok(report);
    }

    [HttpGet("sales-by-product")]
    public async Task<ActionResult<List<SalesByProductReportDto>>> GetSalesByProductReport(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] int? categoryId)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var query = _context.SaleDetails
            .Include(sd => sd.Sale)
            .Include(sd => sd.Product)
            .ThenInclude(p => p.Category)
            .Where(sd => sd.Sale.Status == "Completed" 
                && sd.Sale.SaleDate >= start 
                && sd.Sale.SaleDate <= end);

        if (categoryId.HasValue)
        {
            query = query.Where(sd => sd.Product.CategoryId == categoryId.Value);
        }

        var report = await query
            .GroupBy(sd => new 
            { 
                sd.Product.Id, 
                sd.Product.Name, 
                sd.Product.Brand, 
                CategoryName = sd.Product.Category.Name 
            })
            .Select(g => new SalesByProductReportDto
            {
                ProductId = g.Key.Id,
                ProductName = g.Key.Name,
                Brand = g.Key.Brand,
                CategoryName = g.Key.CategoryName,
                TotalQuantitySold = g.Sum(sd => sd.Quantity),
                TotalRevenue = g.Sum(sd => sd.Subtotal),
                AveragePrice = g.Average(sd => sd.UnitPrice)
            })
            .OrderByDescending(r => r.TotalRevenue)
            .ToListAsync();

        return Ok(report);
    }

    [HttpGet("sales-by-customer")]
    public async Task<ActionResult<List<SalesByCustomerReportDto>>> GetSalesByCustomerReport(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var report = await _context.Sales
            .Include(s => s.Customer)
            .Where(s => s.Status == "Completed" && s.SaleDate >= start && s.SaleDate <= end)
            .GroupBy(s => new { s.CustomerId, s.Customer.FullName, s.Customer.DocumentNumber })
            .Select(g => new SalesByCustomerReportDto
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.FullName,
                DocumentNumber = g.Key.DocumentNumber,
                TotalPurchases = g.Count(),
                TotalSpent = g.Sum(s => s.Total),
                AverageTicket = g.Average(s => s.Total),
                LastPurchaseDate = g.Max(s => s.SaleDate)
            })
            .OrderByDescending(r => r.TotalSpent)
            .ToListAsync();

        return Ok(report);
    }

    // Purchase Reports
    [HttpGet("purchases")]
    public async Task<ActionResult<PurchasesReportDto>> GetPurchasesReport(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var purchases = await _context.Purchases
            .Include(p => p.Supplier)
            .Where(p => p.PurchaseDate >= start && p.PurchaseDate <= end)
            .OrderByDescending(p => p.PurchaseDate)
            .ToListAsync();

        var items = purchases.Select(p => new PurchasesReportItemDto
        {
            PurchaseId = p.Id,
            PurchaseDate = p.PurchaseDate,
            SupplierName = p.Supplier.CompanyName,
            SupplierDocument = p.Supplier.DocumentNumber,
            Total = p.Total,
            ItemsCount = 0, // Purchase details count not available
            Status = "Completed"
        }).ToList();

        var report = new PurchasesReportDto
        {
            StartDate = start,
            EndDate = end,
            Items = items,
            TotalPurchases = purchases.Sum(p => p.Total),
            TotalTransactions = purchases.Count
        };

        return Ok(report);
    }

    [HttpGet("purchases-by-supplier")]
    public async Task<ActionResult<List<PurchasesBySupplierReportDto>>> GetPurchasesBySupplierReport(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var report = await _context.Purchases
            .Include(p => p.Supplier)
            .Where(p => p.PurchaseDate >= start && p.PurchaseDate <= end)
            .GroupBy(p => new { p.SupplierId, p.Supplier.CompanyName, p.Supplier.DocumentNumber })
            .Select(g => new PurchasesBySupplierReportDto
            {
                SupplierId = g.Key.SupplierId,
                SupplierName = g.Key.CompanyName,
                DocumentNumber = g.Key.DocumentNumber,
                TotalPurchases = g.Count(),
                TotalSpent = g.Sum(p => p.Total),
                LastPurchaseDate = g.Max(p => p.PurchaseDate)
            })
            .OrderByDescending(r => r.TotalSpent)
            .ToListAsync();

        return Ok(report);
    }

    // Inventory Reports
    [HttpGet("inventory")]
    public async Task<ActionResult<List<InventoryReportDto>>> GetInventoryReport([FromQuery] int? categoryId)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive);

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        var products = await query.ToListAsync();

        // Get sales data for rotation calculation
        var salesData = await _context.SaleDetails
            .Include(sd => sd.Sale)
            .Where(sd => sd.Sale.Status == "Completed")
            .GroupBy(sd => sd.ProductId)
            .Select(g => new { ProductId = g.Key, TotalSold = g.Sum(sd => sd.Quantity) })
            .ToListAsync();

        var report = products.Select(p =>
        {
            var sold = salesData.FirstOrDefault(s => s.ProductId == p.Id)?.TotalSold ?? 0;
            var rotationRate = p.Stock > 0 ? (decimal)sold / p.Stock : 0;

            return new InventoryReportDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Brand = p.Brand,
                Size = p.Size,
                CategoryName = p.Category.Name,
                CurrentStock = p.Stock,
                UnitPrice = p.Price,
                TotalValue = p.Stock * p.Price,
                TotalSold = sold,
                RotationRate = rotationRate
            };
        }).OrderByDescending(r => r.TotalValue).ToList();

        return Ok(report);
    }

    [HttpGet("inventory-valuation")]
    public async Task<ActionResult> GetInventoryValuation()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .ToListAsync();

        var totalValue = products.Sum(p => p.Stock * p.Price);
        var totalUnits = products.Sum(p => p.Stock);
        var totalProducts = products.Count;

        var byCategory = products
            .GroupBy(p => p.Category.Name)
            .Select(g => new
            {
                Category = g.Key,
                TotalValue = g.Sum(p => p.Stock * p.Price),
                TotalUnits = g.Sum(p => p.Stock),
                Products = g.Count()
            })
            .OrderByDescending(c => c.TotalValue)
            .ToList();

        return Ok(new
        {
            TotalValue = totalValue,
            TotalUnits = totalUnits,
            TotalProducts = totalProducts,
            ByCategory = byCategory
        });
    }

    // Profit/Loss Report
    [HttpGet("profit-loss")]
    public async Task<ActionResult<ProfitLossReportDto>> GetProfitLossReport(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        // Get sales
        var sales = await _context.Sales
            .Include(s => s.SaleDetails)
            .Where(s => s.Status == "Completed" && s.SaleDate >= start && s.SaleDate <= end)
            .ToListAsync();

        var totalSales = sales.Sum(s => s.Total);
        var productsSold = sales.SelectMany(s => s.SaleDetails).Sum(sd => sd.Quantity);

        // Get purchases
        var purchases = await _context.Purchases
            .Include(p => p.Details)
            .Where(p => p.PurchaseDate >= start && p.PurchaseDate <= end)
            .ToListAsync();

        var totalPurchases = purchases.Sum(p => p.Total);
        var productsPurchased = purchases.SelectMany(p => p.Details).Sum(d => d.Quantity);

        var grossProfit = totalSales - totalPurchases;
        var profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

        var report = new ProfitLossReportDto
        {
            StartDate = start,
            EndDate = end,
            TotalSales = totalSales,
            TotalPurchases = totalPurchases,
            GrossProfit = grossProfit,
            ProfitMargin = profitMargin,
            ProductsSold = productsSold,
            ProductsPurchased = productsPurchased
        };

        return Ok(report);
    }

    // Top Products Report
    [HttpGet("top-products")]
    public async Task<ActionResult<TopProductsReportDto>> GetTopProductsReport(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] int limit = 10)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var salesData = await _context.SaleDetails
            .Include(sd => sd.Sale)
            .Include(sd => sd.Product)
            .ThenInclude(p => p.Category)
            .Where(sd => sd.Sale.Status == "Completed" 
                && sd.Sale.SaleDate >= start 
                && sd.Sale.SaleDate <= end)
            .GroupBy(sd => new 
            { 
                sd.Product.Id, 
                sd.Product.Name, 
                sd.Product.Brand, 
                CategoryName = sd.Product.Category.Name 
            })
            .Select(g => new TopProductItemDto
            {
                ProductId = g.Key.Id,
                ProductName = g.Key.Name,
                Brand = g.Key.Brand,
                CategoryName = g.Key.CategoryName,
                QuantitySold = g.Sum(sd => sd.Quantity),
                Revenue = g.Sum(sd => sd.Subtotal)
            })
            .ToListAsync();

        var topByRevenue = salesData.OrderByDescending(p => p.Revenue).Take(limit).ToList();
        var topByQuantity = salesData.OrderByDescending(p => p.QuantitySold).Take(limit).ToList();

        var report = new TopProductsReportDto
        {
            StartDate = start,
            EndDate = end,
            TopByRevenue = topByRevenue,
            TopByQuantity = topByQuantity
        };

        return Ok(report);
    }
}

