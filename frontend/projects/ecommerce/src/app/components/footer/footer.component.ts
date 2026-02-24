import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>NobleStep Shop</h3>
            <p>Tu tienda de confianza para productos de calidad</p>
          </div>
          
          <div class="footer-section">
            <h4>Enlaces Rápidos</h4>
            <ul>
              <li><a routerLink="/">Inicio</a></li>
              <li><a routerLink="/catalog">Catálogo</a></li>
              <li><a routerLink="/contact">Contacto</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Contacto</h4>
            <p>📧 info&#64;noblestep.com</p>
            <p>📞 +51 999 999 999</p>
            <p>📍 Lima, Perú</p>
          </div>
          
          <div class="footer-section">
            <h4>Métodos de Pago</h4>
            <div class="payment-methods">
              <div class="payment-item">
                <img src="/logo_yape.png" alt="Yape" class="payment-logo">
                <span>Yape</span>
              </div>
              <div class="payment-item">
                <span class="payment-icon">💳</span>
                <span>Tarjetas</span>
              </div>
              <div class="payment-item">
                <span class="payment-icon">🏦</span>
                <span>Transferencia</span>
              </div>
            </div>
            <h4 style="margin-top: 1.5rem;">Síguenos</h4>
            <div class="social-links">
              <a href="#" class="social-icon">📘</a>
              <a href="#" class="social-icon">📷</a>
              <a href="#" class="social-icon">🐦</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2026 NobleStep. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-dark);
      color: var(--color-white);
      padding: var(--spacing-2xl) 0 var(--spacing-md);
      margin-top: var(--spacing-2xl);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
    }

    .footer-section h3 {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--spacing-md);
      color: var(--color-cream);
    }

    .footer-section h4 {
      font-size: var(--font-size-lg);
      margin-bottom: var(--spacing-md);
      color: var(--color-success);
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
    }

    .footer-section ul li {
      margin-bottom: var(--spacing-sm);
    }

    .footer-section a {
      color: var(--color-white);
      text-decoration: none;
      transition: var(--transition-base);
    }

    .footer-section a:hover {
      color: var(--color-cream);
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .payment-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      background: var(--color-gray-100);
      border-radius: var(--radius-md);
      transition: var(--transition-base);
    }

    .payment-item:hover {
      background: var(--color-gray-200);
      transform: translateX(4px);
    }

    .payment-logo {
      height: 30px;
      width: auto;
      border-radius: var(--radius-sm);
      background: var(--color-white);
      padding: 2px;
    }

    .payment-icon {
      font-size: var(--font-size-2xl);
    }

    .social-links {
      display: flex;
      gap: var(--spacing-md);
    }

    .social-icon {
      font-size: var(--font-size-2xl);
      transition: var(--transition-base);
    }

    .social-icon:hover {
      transform: scale(1.2);
      filter: brightness(1.2);
    }

    .footer-bottom {
      text-align: center;
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--color-gray-200);
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FooterComponent {}
