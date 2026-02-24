import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      @if (type === 'product-card') {
        <div class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
            <div class="skeleton-footer">
              <div class="skeleton-price"></div>
              <div class="skeleton-button"></div>
            </div>
          </div>
        </div>
      }
      @if (type === 'product-grid') {
        <div class="skeleton-grid">
          @for (item of [1,2,3,4,5,6]; track item) {
            <div class="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-footer">
                  <div class="skeleton-price"></div>
                  <div class="skeleton-button"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }
      @if (type === 'text') {
        <div class="skeleton-text-block">
          @for (line of [1,2,3]; track line) {
            <div class="skeleton-text" [class.short]="line === 3"></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      width: 100%;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-xl);
    }

    .skeleton-card {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }

    .skeleton-image {
      width: 100%;
      height: 200px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100) 25%,
        var(--color-gray-50) 50%,
        var(--color-gray-100) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .skeleton-content {
      padding: var(--spacing-lg);
    }

    .skeleton-title {
      height: 24px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100) 25%,
        var(--color-gray-50) 50%,
        var(--color-gray-100) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-sm);
    }

    .skeleton-text {
      height: 16px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100) 25%,
        var(--color-gray-50) 50%,
        var(--color-gray-100) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-sm);
    }

    .skeleton-text.short {
      width: 60%;
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--spacing-md);
      gap: var(--spacing-sm);
    }

    .skeleton-price {
      height: 28px;
      width: 80px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100) 25%,
        var(--color-gray-50) 50%,
        var(--color-gray-100) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: var(--radius-sm);
    }

    .skeleton-button {
      height: 40px;
      flex: 1;
      background: linear-gradient(
        90deg,
        var(--color-gray-100) 25%,
        var(--color-gray-50) 50%,
        var(--color-gray-100) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: var(--radius-full);
    }

    .skeleton-text-block {
      padding: var(--spacing-md);
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'product-card' | 'product-grid' | 'text' = 'product-card';
}
