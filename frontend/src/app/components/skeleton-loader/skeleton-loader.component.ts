import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper">
      @if (type === 'text') {
        @for (line of lines; track $index) {
          <div class="skeleton-text" [style.width]="$index === lines.length - 1 ? '60%' : '100%'"></div>
        }
      }
      @if (type === 'card') {
        <div class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text" style="width: 80%"></div>
          </div>
        </div>
      }
      @if (type === 'table') {
        <div class="skeleton-table">
          <div class="skeleton-table-header">
            @for (col of columns; track $index) {
              <div class="skeleton-table-cell"></div>
            }
          </div>
          @for (row of rows; track $index) {
            <div class="skeleton-table-row">
              @for (col of columns; track $index) {
                <div class="skeleton-table-cell"></div>
              }
            </div>
          }
        </div>
      }
      @if (type === 'avatar') {
        <div class="skeleton-avatar" [class.large]="size === 'large'"></div>
      }
      @if (type === 'button') {
        <div class="skeleton-button"></div>
      }
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      width: 100%;
    }

    .skeleton-text,
    .skeleton-title,
    .skeleton-image,
    .skeleton-avatar,
    .skeleton-button,
    .skeleton-table-cell {
      background: linear-gradient(
        90deg,
        var(--color-gray-100) 25%,
        var(--color-gray-50) 50%,
        var(--color-gray-100) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-sm);
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    .skeleton-text {
      height: 16px;
      margin-bottom: var(--spacing-sm);
    }

    .skeleton-title {
      height: 24px;
      width: 60%;
      margin-bottom: var(--spacing-md);
    }

    .skeleton-card {
      background: var(--color-white);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .skeleton-image {
      height: 200px;
      width: 100%;
    }

    .skeleton-content {
      padding: var(--spacing-lg);
    }

    .skeleton-table {
      width: 100%;
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .skeleton-table-header,
    .skeleton-table-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
    }

    .skeleton-table-header {
      background: var(--color-gray-50);
    }

    .skeleton-table-row {
      border-bottom: 1px solid var(--color-gray-100);
    }

    .skeleton-table-cell {
      height: 20px;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .skeleton-avatar.large {
      width: 80px;
      height: 80px;
    }

    .skeleton-button {
      height: 40px;
      width: 120px;
      border-radius: var(--radius-md);
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'card' | 'table' | 'avatar' | 'button' = 'text';
  @Input() lines: number = 3;
  @Input() rows: number = 5;
  @Input() columns: number = 4;
  @Input() size: 'normal' | 'large' = 'normal';
}
