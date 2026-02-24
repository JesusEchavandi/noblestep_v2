import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show) {
      <span class="badge" [class]="'badge-' + type">
        {{ text }}
      </span>
    }
  `,
  styles: [`
    .badge {
      position: absolute;
      top: var(--spacing-md);
      left: var(--spacing-md);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 2;
      box-shadow: var(--shadow-md);
      animation: slideInLeft 0.3s ease-out;
    }

    .badge-new {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: var(--color-white);
    }

    .badge-sale {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: var(--color-white);
    }

    .badge-discount {
      background: linear-gradient(135deg, #FF6B6B, #FF5252);
      color: var(--color-white);
      font-size: var(--font-size-sm);
      font-weight: 800;
    }

    .badge-low-stock {
      background: linear-gradient(135deg, #FFA726, #FF9800);
      color: var(--color-white);
    }

    .badge-bestseller {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: var(--color-dark);
    }

    .badge-exclusive {
      background: linear-gradient(135deg, #9C27B0, #7B1FA2);
      color: var(--color-white);
    }

    @keyframes slideInLeft {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ProductBadgeComponent {
  @Input() type: 'new' | 'sale' | 'discount' | 'low-stock' | 'bestseller' | 'exclusive' = 'new';
  @Input() text: string = '';
  @Input() show: boolean = true;
}
