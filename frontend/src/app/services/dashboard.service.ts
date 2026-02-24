import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardMetrics {
  totalSales: number;
  totalSalesCount: number;
  todaySales: number;
  todaySalesCount: number;
  monthSales: number;
  monthSalesCount: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalPurchases: number;
  totalPurchasesCount: number;
  averageSaleAmount: number;
}

export interface DailySales {
  date: string;
  total: number;
  count: number;
}

export interface MonthlySales {
  year: number;
  month: number;
  monthName: string;
  total: number;
  count: number;
}

export interface SalesChartData {
  last7Days: DailySales[];
  last6Months: MonthlySales[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  brand: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  brand: string;
  size: string;
  stock: number;
  price: number;
}

export interface RecentSale {
  id: number;
  saleDate: string;
  customerName: string;
  total: number;
  status: string;
  itemsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`);
  }

  getSalesChartData(): Observable<SalesChartData> {
    return this.http.get<SalesChartData>(`${this.apiUrl}/sales-chart`);
  }

  getTopProducts(limit: number = 5): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/top-products?limit=${limit}`);
  }

  getLowStockProducts(threshold: number = 10): Observable<LowStockProduct[]> {
    return this.http.get<LowStockProduct[]>(`${this.apiUrl}/low-stock?threshold=${threshold}`);
  }

  getRecentSales(limit: number = 10): Observable<RecentSale[]> {
    return this.http.get<RecentSale[]>(`${this.apiUrl}/recent-sales?limit=${limit}`);
  }
}
