import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/dashboard">
            <i class="bi bi-house-door"></i>
            <span>Inicio</span>
          </a>
        </li>
        @for (item of items; track item.label; let isLast = $last) {
          <li class="breadcrumb-item" [class.active]="isLast">
            @if (!isLast && item.url) {
              <a [routerLink]="item.url">
                @if (item.icon) {
                  <i class="bi" [class]="item.icon"></i>
                }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              @if (item.icon) {
                <i class="bi" [class]="item.icon"></i>
              }
              <span>{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      background: var(--color-white);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      animation: slideInDown 0.3s ease-out;
    }

    .breadcrumb {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      animation: fadeInRight 0.3s ease-out;
      animation-fill-mode: both;
    }

    .breadcrumb-item:nth-child(1) { animation-delay: 0.1s; }
    .breadcrumb-item:nth-child(2) { animation-delay: 0.2s; }
    .breadcrumb-item:nth-child(3) { animation-delay: 0.3s; }
    .breadcrumb-item:nth-child(4) { animation-delay: 0.4s; }

    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .breadcrumb-item:not(:last-child)::after {
      content: '/';
      margin-left: var(--spacing-xs);
      color: var(--color-text-muted);
    }

    .breadcrumb-item a {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--color-text-secondary);
      text-decoration: none;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .breadcrumb-item a:hover {
      color: var(--color-primary);
      background: var(--color-gray-50);
      transform: translateX(2px);
    }

    .breadcrumb-item.active {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .breadcrumb-item i {
      font-size: 1rem;
    }
  `]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
