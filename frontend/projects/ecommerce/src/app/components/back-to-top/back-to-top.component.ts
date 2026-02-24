import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showButton) {
      <button class="back-to-top" (click)="scrollToTop()" aria-label="Back to top">
        ↑
      </button>
    }
  `,
  styles: [`
    .back-to-top {
      position: fixed;
      bottom: var(--spacing-xl);
      right: var(--spacing-xl);
      width: 50px;
      height: 50px;
      background: var(--color-primary);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-full);
      font-size: var(--font-size-2xl);
      cursor: pointer;
      z-index: 999;
      box-shadow: var(--shadow-xl);
      transition: var(--transition-base);
      animation: slideInUp 0.3s ease-out;
    }

    .back-to-top:hover {
      background: var(--color-secondary);
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(232, 74, 95, 0.4);
    }

    @keyframes slideInUp {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .back-to-top {
        bottom: var(--spacing-md);
        right: var(--spacing-md);
        width: 45px;
        height: 45px;
      }
    }
  `]
})
export class BackToTopComponent {
  showButton = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showButton = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
