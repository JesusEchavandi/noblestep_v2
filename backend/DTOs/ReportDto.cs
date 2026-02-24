namespace NobleStep.Api.DTOs;

// Sales Reports
public class SalesReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<SalesReportItemDto> Items { get; set; } = new();
    public decimal TotalSales { get; set; }
    public int TotalTransactions { get; set; }
    public decimal AverageTicket { get; set; }
}

public class SalesReportItemDto
{
    public int SaleId { get; set; }
    public DateTime SaleDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerDocument { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int ItemsCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}

public class SalesByProductReportDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AveragePrice { get; set; }
}

public class SalesByCustomerReportDto
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public int TotalPurchases { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal AverageTicket { get; set; }
    public DateTime LastPurchaseDate { get; set; }
}

// Purchase Reports
public class PurchasesReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<PurchasesReportItemDto> Items { get; set; } = new();
    public decimal TotalPurchases { get; set; }
    public int TotalTransactions { get; set; }
}

public class PurchasesReportItemDto
{
    public int PurchaseId { get; set; }
    public DateTime PurchaseDate { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string SupplierDocument { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int ItemsCount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class PurchasesBySupplierReportDto
{
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public int TotalPurchases { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime LastPurchaseDate { get; set; }
}

// Inventory Reports
public class InventoryReportDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalValue { get; set; }
    public int TotalSold { get; set; }
    public decimal RotationRate { get; set; }
}

// Profit/Loss Report
public class ProfitLossReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalPurchases { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal ProfitMargin { get; set; }
    public int ProductsSold { get; set; }
    public int ProductsPurchased { get; set; }
}

// Top Products Report
public class TopProductsReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<TopProductItemDto> TopByRevenue { get; set; } = new();
    public List<TopProductItemDto> TopByQuantity { get; set; } = new();
}

public class TopProductItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}
