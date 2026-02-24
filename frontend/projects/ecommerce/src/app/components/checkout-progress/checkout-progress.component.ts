import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checkout-progress">
      <div class="progress-steps">
        @for (step of steps; track step.id; let i = $index) {
          <div class="step" [class.completed]="i < currentStep" [class.active]="i === currentStep">
            <div class="step-icon">
              @if (i < currentStep) {
                <span>✓</span>
              } @else {
                <span>{{ i + 1 }}</span>
              }
            </div>
            <div class="step-label">{{ step.label }}</div>
          </div>
          @if (i < steps.length - 1) {
            <div class="step-connector" [class.completed]="i < currentStep"></div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .checkout-progress {
      background: var(--color-white);
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 800px;
      margin: 0 auto;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 0 0 auto;
    }

    .step-icon {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-full);
      background: var(--color-gray-100);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: var(--font-size-lg);
      transition: var(--transition-base);
      border: 3px solid var(--color-gray-100);
    }

    .step.active .step-icon {
      background: var(--color-primary);
      color: var(--color-white);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(232, 74, 95, 0.2);
      animation: pulse 2s infinite;
    }

    .step.completed .step-icon {
      background: var(--color-success);
      color: var(--color-white);
      border-color: var(--color-success);
    }

    .step-label {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-secondary);
      text-align: center;
    }

    .step.active .step-label {
      color: var(--color-primary);
    }

    .step.completed .step-label {
      color: var(--color-success);
    }

    .step-connector {
      flex: 1;
      height: 3px;
      background: var(--color-gray-100);
      margin: 0 var(--spacing-sm);
      position: relative;
      top: -20px;
    }

    .step-connector.completed {
      background: var(--color-success);
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 4px rgba(232, 74, 95, 0.2);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(232, 74, 95, 0.1);
      }
    }

    @media (max-width: 768px) {
      .progress-steps {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .step-connector {
        width: 3px;
        height: 30px;
        margin: 0;
        top: 0;
      }

      .step-label {
        font-size: var(--font-size-xs);
      }

      .step-icon {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class CheckoutProgressComponent {
  @Input() currentStep: number = 0;

  steps = [
    { id: 1, label: 'Carrito' },
    { id: 2, label: 'Información' },
    { id: 3, label: 'Pago' },
    { id: 4, label: 'Confirmación' }
  ];
}
