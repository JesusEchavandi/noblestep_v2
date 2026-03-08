import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { EcommerceAuthService, ClienteEcommerce } from '../../services/ecommerce-auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar">
      <!-- Barra superior -->
      <div class="navbar-inner">
        <div class="nav-left">
          <ul class="nav-links">
            <li><a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="cerrarMenu()">Inicio</a></li>
            <li><a routerLink="/catalog" routerLinkActive="active" (click)="cerrarMenu()">Catálogo</a></li>
            <li><a routerLink="/contact" routerLinkActive="active" (click)="cerrarMenu()">Contacto</a></li>
          </ul>
        </div>

        <a routerLink="/" class="logo">
          <img src="logo.svg" alt="NobleStep Logo" class="logo-img">
          <strong class="logo-text">NobleStep</strong>
        </a>

        <div class="nav-right">
          <!-- Barra de búsqueda -->
          <div class="search-bar" [class.open]="busquedaAbierta">
            <button class="search-toggle" (click)="alternarBusqueda()" aria-label="Buscar">
              <i class="fi fi-rr-search"></i>
            </button>
            <input *ngIf="busquedaAbierta" #searchInput type="text" [(ngModel)]="consultaBusqueda" placeholder="Buscar productos..." (keyup.enter)="buscar()" (keyup.escape)="cerrarBusqueda()" class="search-input" />
          </div>

          <!-- Carrito -->
          <a routerLink="/cart" class="cart-btn" (click)="cerrarMenu()">
            <i class="fi fi-rr-shopping-bag"></i>
            <span class="cart-count" *ngIf="cantidadItemsCarrito > 0">{{ cantidadItemsCarrito }}</span>
          </a>

          <!-- Cuenta -->
          <a *ngIf="!estaAutenticado" routerLink="/login" class="icon-btn" (click)="cerrarMenu()" title="Iniciar Sesión">
            <i class="fi fi-rr-user"></i>
          </a>
          <a *ngIf="estaAutenticado" routerLink="/account" class="icon-btn user-logged" (click)="cerrarMenu()" title="{{ clienteActual?.nombreCompleto }}">
            <i class="fi fi-rr-circle-user"></i>
          </a>

          <!-- Toggle móvil -->
          <button class="menu-toggle" (click)="alternarMenu()" [class.active]="menuAbierto" aria-label="Menú">
            <i class="fi fi-rr-menu-burger"></i>
          </button>
        </div>
      </div>

      <!-- Menú móvil -->
      <div class="mobile-menu" [class.open]="menuAbierto">
        <ul class="mobile-links">
          <li><a routerLink="/" (click)="cerrarMenu()">Inicio</a></li>
          <li><a routerLink="/catalog" (click)="cerrarMenu()">Catálogo</a></li>
          <li><a routerLink="/contact" (click)="cerrarMenu()">Contacto</a></li>
          <li *ngIf="!estaAutenticado"><a routerLink="/login" (click)="cerrarMenu()">Iniciar Sesión</a></li>
          <li *ngIf="estaAutenticado"><a routerLink="/account" (click)="cerrarMenu()">Mi Cuenta</a></li>
        </ul>
        <div class="mobile-search">
          <input type="text" [(ngModel)]="consultaBusqueda" placeholder="Buscar productos..." (keyup.enter)="buscar()" />
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--color-dark);
      border-bottom: 3px solid var(--color-primary);
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
      height: 70px;
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
      color: rgba(255, 255, 255, 0.85);
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
      color: var(--color-white);
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
      color: var(--color-white);
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
      color: rgba(255, 255, 255, 0.85);
      transition: var(--transition-base);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
    }

    .icon-btn:hover {
      color: var(--color-white);
    }

    .icon-btn.user-logged {
      color: var(--color-cream);
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
      color: rgba(255, 255, 255, 0.85);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      transition: var(--transition-base);
    }

    .search-toggle:hover {
      color: var(--color-white);
    }

    .search-input {
      border: none;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.6);
      outline: none;
      font-size: var(--font-size-sm);
      color: var(--color-white);
      background: transparent;
      width: min(180px, 40vw);
      padding: 0.2rem 0;
      font-family: inherit;
      animation: slideIn 0.2s ease-out;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
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
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      transition: var(--transition-base);
      padding: 0.25rem;
    }

    .cart-btn:hover {
      color: var(--color-white);
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
      color: var(--color-white);
    }

    .menu-toggle span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--color-white);
      transition: var(--transition-base);
      border-radius: 2px;
    }

    .menu-toggle.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .menu-toggle.active span:nth-child(2) { opacity: 0; }
    .menu-toggle.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile Menu */
    .mobile-menu {
      display: none;
      background: var(--color-dark);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
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
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
      font-size: var(--font-size-base);
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .mobile-links li a:hover { color: var(--color-white); }

    .mobile-search input {
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-full);
      padding: 0.6rem 1rem;
      font-size: var(--font-size-sm);
      outline: none;
      font-family: inherit;
      color: var(--color-white);
      background: rgba(255, 255, 255, 0.1);
    }

    /* Responsive */

    /* Laptop 1366px */
    @media (max-width: 1399px) {
      .navbar-inner { max-width: 100%; padding: 0 1.25rem; }
      .logo-text { font-size: 1.4rem; }
      .search-input { width: 180px; font-size: 0.8rem; }
      .nav-left a { font-size: 0.82rem; }
      .nav-right .icon-btn { font-size: 0.95rem; }
    }

    /* QHD 2560x1440 */
    @media (min-width: 1920px) {
      .navbar-inner { max-width: 1440px; }
      .logo-text { font-size: 1.75rem; }
      .search-input { width: 300px; font-size: 0.95rem; }
      .nav-left a { font-size: var(--font-size-base); }
      .nav-left { gap: var(--spacing-xl); }
      .nav-right .icon-btn { font-size: 1.15rem; }
      .cart-count { font-size: 0.65rem; width: 18px; height: 18px; }
    }

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
  cantidadItemsCarrito = 0;
  clienteActual: ClienteEcommerce | null = null;
  estaAutenticado = false;
  menuAbierto = false;
  busquedaAbierta = false;
  consultaBusqueda = '';

  @ViewChild('searchInput') searchInputRef?: ElementRef;

  constructor(
    private cartService: CartService,
    private authService: EcommerceAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.carrito$.subscribe(() => {
      this.cantidadItemsCarrito = this.cartService.obtenerCantidadItems();
    });
    this.authService.clienteActual$.subscribe(cliente => {
      this.clienteActual = cliente;
      this.estaAutenticado = !!cliente;
    });
  }

  alternarMenu() { this.menuAbierto = !this.menuAbierto; }
  cerrarMenu() { this.menuAbierto = false; }

  alternarBusqueda() {
    this.busquedaAbierta = !this.busquedaAbierta;
    if (this.busquedaAbierta) {
      setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 50);
    }
  }

  cerrarBusqueda() {
    this.busquedaAbierta = false;
    this.consultaBusqueda = '';
  }

  buscar() {
    if (this.consultaBusqueda.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { q: this.consultaBusqueda.trim() } });
      this.cerrarBusqueda();
      this.cerrarMenu();
    }
  }

  cerrarSesion() { this.authService.cerrarSesion(); }
}
