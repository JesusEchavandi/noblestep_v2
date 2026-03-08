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

        <form (ngSubmit)="alEnviar()" class="reset-form">
          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              [(ngModel)]="nuevaContrasena"
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
              [(ngModel)]="confirmarContrasena"
              name="confirmPassword"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn-primary" [disabled]="cargando">
            {{ cargando ? 'Restableciendo...' : 'Restablecer Contraseña' }}
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

    /* Responsive */

    /* Laptop 1366px */
    @media (max-width: 1399px) {
      .reset-card { padding: 2.25rem; max-width: 440px; }
      .reset-header h1 { font-size: 1.6rem; }
      .form-group input { padding: 0.65rem; font-size: 0.9rem; }
      .btn-primary { padding: 0.75rem; font-size: 0.9rem; }
    }

    /* QHD 2560x1440 */
    @media (min-width: 1920px) {
      .reset-card { padding: 3.5rem; max-width: 560px; }
      .reset-header h1 { font-size: 2.5rem; }
      .reset-header p { font-size: 1.1rem; }
      .form-group label { font-size: 1.05rem; }
      .form-group input { padding: 1rem; font-size: 1.1rem; }
      .btn-primary { padding: 1.1rem; font-size: 1.1rem; }
    }

    @media (max-width: 480px) {
      .reset-container { padding: 1rem; }
      .reset-card { padding: 1.75rem; }
      .reset-header h1 { font-size: 1.5rem; }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  nuevaContrasena = '';
  confirmarContrasena = '';
  cargando = false;

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

  alEnviar() {
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      this.notificationService.warning('Por favor completa todos los campos');
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      this.notificationService.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.notificationService.warning('Las contraseñas no coinciden');
      return;
    }

    this.cargando = true;
    this.authService.restablecerContrasena(this.token, this.nuevaContrasena).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
        this.notificationService.success('Contraseña restablecida exitosamente');
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.cargando = false;
        this.notificationService.error(error.error?.message || 'Error al restablecer la contraseña');
      }
    });
  }
}
