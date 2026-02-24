import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reset-container">
      <div class="reset-card">
        <div class="reset-header">
          <h1>Restablecer Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="reset-form">
          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              [(ngModel)]="newPassword"
              name="newPassword"
              placeholder="••••••••"
              required
            />
            <small>Mínimo 6 caracteres</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Restableciendo...' : 'Restablecer Contraseña' }}
          </button>

          <div class="back-to-login">
            <a routerLink="/login" class="link">Volver al inicio de sesión</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .reset-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .reset-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 3rem;
      max-width: 500px;
      width: 100%;
    }

    .reset-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .reset-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #1f2937;
    }

    .reset-header p {
      color: #6b7280;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group small {
      display: block;
      margin-top: 0.25rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .back-to-login {
      text-align: center;
      margin-top: 1.5rem;
    }

    .link {
      color: #667eea;
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;

  constructor(
    private authService: EcommerceAuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    
    if (!this.token) {
      this.notificationService.error('Token inválido');
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.notificationService.warning('Por favor completa todos los campos');
      return;
    }

    if (this.newPassword.length < 6) {
      this.notificationService.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.warning('Las contraseñas no coinciden');
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success('Contraseña restablecida exitosamente');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(error.error?.message || 'Error al restablecer la contraseña');
      }
    });
  }
}
