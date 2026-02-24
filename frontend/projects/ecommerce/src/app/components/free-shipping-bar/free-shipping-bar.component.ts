import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-free-shipping-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shipping-bar" [class.achieved]="isAchieved">
      <div class="message">
        @if (!isAchieved) {
          <span class="icon">🚚</span>
          <span>¡Te faltan <strong>{{ formatPrice(remaining) }}</strong> para envío gratis!</span>
        } @else {
          <span class="icon">✓</span>
          <span><strong>¡Felicidades! Tienes envío gratis</strong></span>
        }
      </div>
      <div class="progress-container">
        <div class="progress-bar" [style.width.%]="progress"></div>
      </div>
      <div class="amount-info">
        <span>{{ formatPrice(currentAmount) }}</span>
        <span>{{ formatPrice(freeShippingThreshold) }}</span>
      </div>
    </div>
  `,
  styles: [`
    .shipping-bar {
      background: linear-gradient(135deg, var(--color-cream) 0%, var(--color-background) 100%);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-lg);
      border: 2px solid var(--color-gray-100);
      transition: var(--transition-base);
    }

    .shipping-bar.achieved {
      background: linear-gradient(135deg, var(--color-success) 0%, #7CB68E 100%);
      border-color: var(--color-success);
      color: var(--color-white);
    }

    .message {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      justify-content: center;
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-base);
    }

    .icon {
      font-size: var(--font-size-xl);
    }

    .progress-container {
      background: rgba(42, 54, 59, 0.1);
      height: 12px;
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: var(--spacing-sm);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--color-success) 0%, var(--color-secondary) 100%);
      transition: width 0.5s ease-out;
      border-radius: var(--radius-full);
      position: relative;
      overflow: hidden;
    }

    .progress-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .amount-info {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .shipping-bar.achieved .amount-info {
      color: var(--color-white);
      opacity: 0.9;
    }
  `]
})
export class FreeShippingBarComponent implements OnInit {
  @Input() currentAmount: number = 0;
  @Input() freeShippingThreshold: number = 100;

  progress: number = 0;
  remaining: number = 0;
  isAchieved: boolean = false;

  ngOnInit() {
    this.calculate();
  }

  ngOnChanges() {
    this.calculate();
  }

  calculate() {
    this.progress = Math.min((this.currentAmount / this.freeShippingThreshold) * 100, 100);
    this.remaining = Math.max(this.freeShippingThreshold - this.currentAmount, 0);
    this.isAchieved = this.currentAmount >= this.freeShippingThreshold;
  }

  formatPrice(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }
}
