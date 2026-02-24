namespace NobleStep.Api.DTOs;

public class DashboardMetricsDto
{
    public decimal TotalSales { get; set; }
    public int TotalSalesCount { get; set; }
    public decimal TodaySales { get; set; }
    public int TodaySalesCount { get; set; }
    public decimal MonthSales { get; set; }
    public int MonthSalesCount { get; set; }
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalSuppliers { get; set; }
    public decimal TotalPurchases { get; set; }
    public int TotalPurchasesCount { get; set; }
    public decimal AverageSaleAmount { get; set; }
}

public class SalesChartDataDto
{
    public List<DailySalesDto> Last7Days { get; set; } = new();
    public List<MonthlySalesDto> Last6Months { get; set; } = new();
}

public class DailySalesDto
{
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
    public int Count { get; set; }
}

public class MonthlySalesDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int Count { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class LowStockProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Stock { get; set; }
    public decimal Price { get; set; }
}

public class RecentSaleDto
{
    public int Id { get; set; }
    public DateTime SaleDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ItemsCount { get; set; }
}
