import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div *ngFor="let notification of notifications" 
           class="notification notification-{{notification.type}}"
           [@slideIn]>
        <div class="notification-icon">
          <span *ngIf="notification.type === 'success'">✓</span>
          <span *ngIf="notification.type === 'error'">✕</span>
          <span *ngIf="notification.type === 'info'">ℹ</span>
          <span *ngIf="notification.type === 'warning'">⚠</span>
        </div>
        <div class="notification-message">{{ notification.message }}</div>
        <button class="notification-close" (click)="close(notification.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: var(--spacing-xl);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      background: var(--color-white);
      border-left: 4px solid;
      animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      position: relative;
      overflow: hidden;
    }

    .notification::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, currentColor);
      animation: progress 3s linear;
    }

    @keyframes slideIn {
      from {
        transform: translateX(450px) scale(0.8);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    .notification-success {
      border-left-color: var(--color-success);
    }

    .notification-success::before {
      color: var(--color-success);
    }

    .notification-error {
      border-left-color: var(--color-primary);
    }

    .notification-error::before {
      color: var(--color-primary);
    }

    .notification-info {
      border-left-color: #3b82f6;
    }

    .notification-info::before {
      color: #3b82f6;
    }

    .notification-warning {
      border-left-color: var(--color-secondary);
    }

    .notification-warning::before {
      color: var(--color-secondary);
    }

    .notification-icon {
      font-size: var(--font-size-2xl);
      font-weight: bold;
      flex-shrink: 0;
      animation: iconPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes iconPop {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }

    .notification-success .notification-icon {
      color: var(--color-success);
    }

    .notification-error .notification-icon {
      color: var(--color-primary);
    }

    .notification-info .notification-icon {
      color: #3b82f6;
    }

    .notification-warning .notification-icon {
      color: var(--color-secondary);
    }

    .notification-message {
      flex: 1;
      color: var(--color-dark);
      font-size: var(--font-size-sm);
      line-height: 1.5;
      font-weight: 500;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: var(--font-size-2xl);
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: var(--transition-fast);
      border-radius: var(--radius-full);
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      color: var(--color-dark);
      background: var(--color-gray-100);
      transform: rotate(90deg);
    }

    @media (max-width: 768px) {
      .notification-container {
        left: var(--spacing-md);
        right: var(--spacing-md);
        max-width: none;
        top: 70px;
      }
    }
  `]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe(
      notifications => this.notifications = notifications
    );
  }

  close(id: number) {
    this.notificationService.remove(id);
  }
}
