import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Sales Reports
export interface SalesReport {
  startDate: string;
  endDate: string;
  items: SalesReportItem[];
  totalSales: number;
  totalTransactions: number;
  averageTicket: number;
}

export interface SalesReportItem {
  saleId: number;
  saleDate: string;
  customerName: string;
  customerDocument: string;
  total: number;
  itemsCount: number;
  status: string;
  userName: string;
}

export interface SalesByProduct {
  productId: number;
  productName: string;
  brand: string;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface SalesByCustomer {
  customerId: number;
  customerName: string;
  documentNumber: string;
  totalPurchases: number;
  totalSpent: number;
  averageTicket: number;
  lastPurchaseDate: string;
}

// Purchase Reports
export interface PurchasesReport {
  startDate: string;
  endDate: string;
  items: PurchasesReportItem[];
  totalPurchases: number;
  totalTransactions: number;
}

export interface PurchasesReportItem {
  purchaseId: number;
  purchaseDate: string;
  supplierName: string;
  supplierDocument: string;
  total: number;
  itemsCount: number;
  status: string;
}

export interface PurchasesBySupplier {
  supplierId: number;
  supplierName: string;
  documentNumber: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate: string;
}

// Inventory Reports
export interface InventoryReport {
  productId: number;
  productName: string;
  brand: string;
  size: string;
  categoryName: string;
  currentStock: number;
  unitPrice: number;
  totalValue: number;
  totalSold: number;
  rotationRate: number;
}

export interface InventoryValuation {
  totalValue: number;
  totalUnits: number;
  totalProducts: number;
  byCategory: CategoryValuation[];
}

export interface CategoryValuation {
  category: string;
  totalValue: number;
  totalUnits: number;
  products: number;
}

// Profit/Loss Report
export interface ProfitLossReport {
  startDate: string;
  endDate: string;
  totalSales: number;
  totalPurchases: number;
  grossProfit: number;
  profitMargin: number;
  productsSold: number;
  productsPurchased: number;
}

// Top Products Report
export interface TopProductsReport {
  startDate: string;
  endDate: string;
  topByRevenue: TopProduct[];
  topByQuantity: TopProduct[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  brand: string;
  categoryName: string;
  quantitySold: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  // Sales Reports
  getSalesReport(startDate?: string, endDate?: string): Observable<SalesReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<SalesReport>(`${this.apiUrl}/sales`, { params });
  }

  getSalesByProduct(startDate?: string, endDate?: string, categoryId?: number): Observable<SalesByProduct[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    // Solo agregar categoryId si tiene un valor numérico válido
    if (categoryId !== null && categoryId !== undefined && !isNaN(categoryId)) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<SalesByProduct[]>(`${this.apiUrl}/sales-by-product`, { params });
  }

  getSalesByCustomer(startDate?: string, endDate?: string): Observable<SalesByCustomer[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<SalesByCustomer[]>(`${this.apiUrl}/sales-by-customer`, { params });
  }

  // Purchase Reports
  getPurchasesReport(startDate?: string, endDate?: string): Observable<PurchasesReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<PurchasesReport>(`${this.apiUrl}/purchases`, { params });
  }

  getPurchasesBySupplier(startDate?: string, endDate?: string): Observable<PurchasesBySupplier[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<PurchasesBySupplier[]>(`${this.apiUrl}/purchases-by-supplier`, { params });
  }

  // Inventory Reports
  getInventoryReport(categoryId?: number): Observable<InventoryReport[]> {
    let params = new HttpParams();
    // Solo agregar categoryId si tiene un valor numérico válido
    if (categoryId !== null && categoryId !== undefined && !isNaN(categoryId)) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<InventoryReport[]>(`${this.apiUrl}/inventory`, { params });
  }

  getInventoryValuation(): Observable<InventoryValuation> {
    return this.http.get<InventoryValuation>(`${this.apiUrl}/inventory-valuation`);
  }

  // Profit/Loss Report
  getProfitLossReport(startDate?: string, endDate?: string): Observable<ProfitLossReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ProfitLossReport>(`${this.apiUrl}/profit-loss`, { params });
  }

  // Top Products Report
  getTopProductsReport(startDate?: string, endDate?: string, limit: number = 10): Observable<TopProductsReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    params = params.set('limit', limit.toString());
    return this.http.get<TopProductsReport>(`${this.apiUrl}/top-products`, { params });
  }

  // Export to CSV
  exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
