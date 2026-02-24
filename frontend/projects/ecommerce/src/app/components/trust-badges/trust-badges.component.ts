import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trust-badges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trust-badges">
      <div class="badge-item">
        <div class="icon">🔒</div>
        <div class="text">
          <strong>Compra Segura</strong>
          <span>Pago 100% Protegido</span>
        </div>
      </div>
      <div class="badge-item">
        <div class="icon">🚚</div>
        <div class="text">
          <strong>Envío Gratis</strong>
          <span>En pedidos +S/ 100</span>
        </div>
      </div>
      <div class="badge-item">
        <div class="icon">↩️</div>
        <div class="text">
          <strong>Devolución Fácil</strong>
          <span>Garantía 30 días</span>
        </div>
      </div>
      <div class="badge-item">
        <div class="icon">💳</div>
        <div class="text">
          <strong>Pago Seguro</strong>
          <span>Visa, Mastercard, Yape</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .trust-badges {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      background: var(--color-white);
      border-top: 1px solid var(--color-gray-100);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .badge-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-right: 1px solid var(--color-gray-100);
      transition: var(--transition-base);
    }

    .badge-item:last-child {
      border-right: none;
    }

    .badge-item:hover {
      background: var(--color-background);
    }

    .icon {
      font-size: 1.8rem;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--color-cream) 0%, rgba(254,206,168,0.4) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .text strong {
      font-size: var(--font-size-sm);
      color: var(--color-dark);
      font-weight: 700;
    }

    .text span {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    @media (max-width: 768px) {
      .trust-badges {
        grid-template-columns: repeat(2, 1fr);
      }
      .badge-item:nth-child(2) {
        border-right: none;
      }
      .badge-item:nth-child(3) {
        border-top: 1px solid var(--color-gray-100);
      }
      .badge-item:nth-child(4) {
        border-top: 1px solid var(--color-gray-100);
        border-right: none;
      }
    }

    @media (max-width: 480px) {
      .trust-badges {
        grid-template-columns: 1fr;
      }
      .badge-item {
        border-right: none;
        border-bottom: 1px solid var(--color-gray-100);
      }
      .badge-item:last-child {
        border-bottom: none;
      }
      .badge-item:nth-child(2),
      .badge-item:nth-child(3),
      .badge-item:nth-child(4) {
        border-top: none;
      }
    }
  `]
})
export class TrustBadgesComponent {}
