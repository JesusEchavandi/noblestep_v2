import { Routes } from '@angular/router';
import { guardiaAutenticacionEcommerce } from './guards/ecommerce-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'catalog', 
    loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  { 
    path: 'checkout', 
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  { 
    path: 'privacy', 
    loadComponent: () => import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  { 
    path: 'terms', 
    loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent)
  },
  { 
    path: 'claims-book', 
    loadComponent: () => import('./pages/claims-book/claims-book.component').then(m => m.ClaimsBookComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  { 
    path: 'account', 
    loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent),
    canActivate: [guardiaAutenticacionEcommerce]
  },
  { path: '**', redirectTo: 'home' }
];
