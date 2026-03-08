import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">

            <div class="footer-col brand-col">
              <span class="brand-name">NobleStep</span>
              <p class="brand-desc">Calzado de calidad para cada paso. Envíos a todo el Perú.</p>
              <div class="payment-section">
                <span class="payment-label">Aceptamos:</span>
                <div class="payment-icons">
                  <span class="payment-tag">Yape</span>
                  <span class="payment-tag">Visa</span>
                  <span class="payment-tag">Mastercard</span>
                  <span class="payment-tag">Transferencia</span>
                </div>
              </div>
            </div>

            <div class="footer-col">
              <h4>Tienda</h4>
              <ul>
                <li><a routerLink="/">Inicio</a></li>
                <li><a routerLink="/catalog">Catálogo</a></li>
                <li><a routerLink="/contact">Contacto</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a routerLink="/privacy">Política de Privacidad</a></li>
                <li><a routerLink="/terms">Términos y Condiciones</a></li>
                <li><a routerLink="/claims-book">📋 Libro de Reclamaciones</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Contacto</h4>
              <ul class="contact-list">
                <li>info&#64;noblestep.com</li>
                <li>+51 999 999 999</li>
                <li>Lima, Perú</li>
              </ul>
              <div class="schedule">
                <span>Lun - Sáb: 9:00 - 18:00</span>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <span>&copy; 2026 NobleStep. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      font-family: var(--font-family-base);
      margin-top: auto;
    }

    .footer-main {
      background: var(--color-dark);
      color: rgba(255, 255, 255, 0.85);
      padding: 2.5rem 0 1.5rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
    }

    .brand-name {
      display: block;
      font-size: 1.35rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .brand-desc {
      font-size: 0.875rem;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 1.25rem;
      max-width: 320px;
    }

    .payment-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .payment-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.45);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .payment-icons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .payment-tag {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.1);
      padding: 3px 8px;
      border-radius: 3px;
    }

    .footer-col h4 {
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 1rem;
    }

    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-col ul li {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .footer-col a {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-col a:hover {
      color: #fff;
    }

    .schedule {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .footer-bottom {
      background: #1e2a2f;
      padding: 0.85rem 0;
      text-align: center;
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.4);
    }

    /* Laptop 1366px */
    @media (max-width: 1399px) {
      .footer-main { padding: 2rem 0 1.25rem; }
      .footer-grid { gap: 2rem; }
      .brand-name { font-size: 1.2rem; }
    }

    /* QHD+ */
    @media (min-width: 1920px) {
      .container { max-width: 1440px; }
      .footer-main { padding: 3rem 0 2rem; }
      .brand-name { font-size: 1.5rem; }
      .footer-col h4 { font-size: 0.9rem; }
      .footer-col ul li,
      .footer-col a { font-size: 0.95rem; }
      .brand-desc { font-size: 0.95rem; }
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      .brand-col {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 480px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      .brand-col {
        grid-column: auto;
      }
    }
  `]
})
export class FooterComponent {}
