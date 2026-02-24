import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { EcommerceAuthService, EcommerceCustomer } from '../../services/ecommerce-auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar">
      <!-- Top bar -->
      <div class="navbar-inner">
        <div class="nav-left">
          <ul class="nav-links">
            <li><a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Inicio</a></li>
            <li><a routerLink="/catalog" routerLinkActive="active" (click)="closeMenu()">Catálogo</a></li>
            <li><a routerLink="/contact" routerLinkActive="active" (click)="closeMenu()">Contacto</a></li>
          </ul>
        </div>

        <a routerLink="/" class="logo">
          <img src="logo.svg" alt="NobleStep Logo" class="logo-img">
          <strong class="logo-text">NobleStep</strong>
        </a>

        <div class="nav-right">
          <!-- Search bar -->
          <div class="search-bar" [class.open]="searchOpen">
            <button class="search-toggle" (click)="toggleSearch()" aria-label="Buscar">
              <i class="fi fi-rr-search"></i>
            </button>
            <input *ngIf="searchOpen" #searchInput type="text" [(ngModel)]="searchQuery" placeholder="Buscar productos..." (keyup.enter)="doSearch()" (keyup.escape)="closeSearch()" class="search-input" />
          </div>

          <!-- Cart -->
          <a routerLink="/cart" class="cart-btn" (click)="closeMenu()">
            <i class="fi fi-rr-shopping-bag"></i>
            <span class="cart-count" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
          </a>

          <!-- Account -->
          <a *ngIf="!isAuthenticated" routerLink="/login" class="icon-btn" (click)="closeMenu()" title="Iniciar Sesión">
            <i class="fi fi-rr-user"></i>
          </a>
          <a *ngIf="isAuthenticated" routerLink="/account" class="icon-btn user-logged" (click)="closeMenu()" title="{{ currentCustomer?.fullName }}">
            <i class="fi fi-rr-circle-user"></i>
          </a>

          <!-- Mobile toggle -->
          <button class="menu-toggle" (click)="toggleMenu()" [class.active]="menuOpen" aria-label="Menú">
            <i class="fi fi-rr-menu-burger"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.open]="menuOpen">
        <ul class="mobile-links">
          <li><a routerLink="/" (click)="closeMenu()">Inicio</a></li>
          <li><a routerLink="/catalog" (click)="closeMenu()">Catálogo</a></li>
          <li><a routerLink="/contact" (click)="closeMenu()">Contacto</a></li>
          <li *ngIf="!isAuthenticated"><a routerLink="/login" (click)="closeMenu()">Iniciar Sesión</a></li>
          <li *ngIf="isAuthenticated"><a routerLink="/account" (click)="closeMenu()">Mi Cuenta</a></li>
        </ul>
        <div class="mobile-search">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar productos..." (keyup.enter)="doSearch()" />
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--color-white);
      border-bottom: 1px solid var(--color-gray-100);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      height: 64px;
    }

    /* LEFT — nav links */
    .nav-left {
      display: flex;
      align-items: center;
    }

    .nav-links {
      display: flex;
      list-style: none;
      gap: var(--spacing-lg);
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      color: var(--color-dark);
      text-decoration: none;
      font-weight: 500;
      font-size: var(--font-size-sm);
      transition: var(--transition-base);
      letter-spacing: 0.2px;
      padding: 0.25rem 0;
      border-bottom: 2px solid transparent;
    }

    .nav-links a:hover,
    .nav-links a.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }

    /* CENTER — logo */
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      text-decoration: none;
    }

    .logo-img {
      height: 40px;
      width: auto;
      transition: transform 0.3s ease;
    }

    .logo-img:hover {
      transform: scale(1.05);
    }

    .logo-text {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--color-dark);
      letter-spacing: -1px;
      font-style: italic;
    }

    /* RIGHT — actions */
    .nav-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-md);
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-dark);
      transition: var(--transition-base);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
    }

    .icon-btn:hover {
      color: var(--color-primary);
    }

    .icon-btn.user-logged {
      color: var(--color-primary);
    }

    /* Search */
    .search-bar {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .search-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-dark);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      transition: var(--transition-base);
    }

    .search-toggle:hover {
      color: var(--color-primary);
    }

    .search-input {
      border: none;
      border-bottom: 1.5px solid var(--color-dark);
      outline: none;
      font-size: var(--font-size-sm);
      color: var(--color-dark);
      background: transparent;
      width: min(180px, 40vw);
      padding: 0.2rem 0;
      font-family: inherit;
      animation: slideIn 0.2s ease-out;
    }

    .search-input::placeholder {
      color: var(--color-gray-400);
    }

    @keyframes slideIn {
      from { width: 0; opacity: 0; }
      to { width: min(180px, 40vw); opacity: 1; }
    }

    /* Cart */
    .cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      color: var(--color-dark);
      text-decoration: none;
      transition: var(--transition-base);
      padding: 0.25rem;
    }

    .cart-btn:hover {
      color: var(--color-primary);
    }

    .cart-count {
      position: absolute;
      top: -6px;
      right: -8px;
      background: var(--color-primary);
      color: var(--color-white);
      border-radius: var(--radius-full);
      font-size: 0.65rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    /* Mobile toggle */
    .menu-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .menu-toggle span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--color-dark);
      transition: var(--transition-base);
      border-radius: 2px;
    }

    .menu-toggle.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .menu-toggle.active span:nth-child(2) { opacity: 0; }
    .menu-toggle.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile Menu */
    .mobile-menu {
      display: none;
      background: var(--color-white);
      border-top: 1px solid var(--color-gray-100);
      padding: var(--spacing-lg) var(--spacing-xl);
    }

    .mobile-menu.open {
      display: block;
    }

    .mobile-links {
      list-style: none;
      margin: 0 0 var(--spacing-md);
      padding: 0;
    }

    .mobile-links li a {
      display: block;
      padding: var(--spacing-sm) 0;
      color: var(--color-dark);
      font-weight: 500;
      font-size: var(--font-size-base);
      text-decoration: none;
      border-bottom: 1px solid var(--color-gray-100);
    }

    .mobile-links li a:hover { color: var(--color-primary); }

    .mobile-search input {
      width: 100%;
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-full);
      padding: 0.6rem 1rem;
      font-size: var(--font-size-sm);
      outline: none;
      font-family: inherit;
      color: var(--color-dark);
    }

    /* Responsive */
    @media (max-width: 992px) {
      .nav-left { display: none; }
      .menu-toggle { display: flex; }
    }

    @media (max-width: 768px) {
      .navbar-inner {
        padding: 0 var(--spacing-md);
        height: 56px;
      }
      .logo-text { font-size: 1.3rem; }
      .logo-img { height: 32px; }
    }

    @media (max-width: 480px) {
      .navbar-inner { padding: 0 var(--spacing-sm); }
      .logo-text { font-size: 1.1rem; }
      .logo-img { height: 28px; }
      .search-input { width: 130px; }
    }

    @media (max-width: 360px) {
      .logo-text { display: none; }
      .nav-right { gap: var(--spacing-sm); }
    }
  `]
})
export class NavbarComponent implements OnInit {
  cartItemCount = 0;
  currentCustomer: EcommerceCustomer | null = null;
  isAuthenticated = false;
  menuOpen = false;
  searchOpen = false;
  searchQuery = '';

  @ViewChild('searchInput') searchInputRef?: ElementRef;

  constructor(
    private cartService: CartService,
    private authService: EcommerceAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
    this.authService.currentCustomer$.subscribe(customer => {
      this.currentCustomer = customer;
      this.isAuthenticated = !!customer;
    });
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }

  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    if (this.searchOpen) {
      setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 50);
    }
  }

  closeSearch() {
    this.searchOpen = false;
    this.searchQuery = '';
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { q: this.searchQuery.trim() } });
      this.closeSearch();
      this.closeMenu();
    }
  }

  logout() { this.authService.logout(); }
}
