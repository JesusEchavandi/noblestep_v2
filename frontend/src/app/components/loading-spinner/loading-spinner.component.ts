import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class.fullscreen]="fullscreen">
      @if (type === 'spinner') {
        <div class="spinner-border" [style.color]="color" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      }
      @if (type === 'dots') {
        <div class="loading-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      }
      @if (type === 'pulse') {
        <div class="pulse-loader"></div>
      }
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
    }

    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }

    .loading-dots {
      display: flex;
      gap: 0.5rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      background: var(--color-primary);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) {
      animation-delay: -0.32s;
    }

    .dot:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .pulse-loader {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--color-primary);
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.5);
        opacity: 0.3;
      }
    }

    .loading-message {
      margin-top: var(--spacing-md);
      color: var(--color-text-secondary);
      font-weight: 500;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() type: 'spinner' | 'dots' | 'pulse' = 'spinner';
  @Input() color: string = 'var(--color-primary)';
  @Input() message: string = '';
  @Input() fullscreen: boolean = false;
}
