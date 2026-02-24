import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./products/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./products/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./products/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/category-list.component').then(m => m.CategoryListComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/customer-list.component').then(m => m.CustomerListComponent)
      },
      {
        path: 'sales',
        loadComponent: () => import('./sales/sale-list.component').then(m => m.SaleListComponent)
      },
      {
        path: 'sales/new',
        loadComponent: () => import('./sales/sale-form.component').then(m => m.SaleFormComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./suppliers/supplier-list.component').then(m => m.SupplierListComponent)
      },
      {
        path: 'purchases',
        loadComponent: () => import('./purchases/purchase-list.component').then(m => m.PurchaseListComponent)
      },
      {
        path: 'purchases/new',
        loadComponent: () => import('./purchases/purchase-form.component').then(m => m.PurchaseFormComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'ecommerce-orders',
        loadComponent: () => import('./ecommerce-orders/ecommerce-orders.component').then(m => m.EcommerceOrdersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
