import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <!-- Left panel: imagen editorial -->
      <div class="login-visual">
        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80" alt="NobleStep" class="visual-img" />
        <div class="visual-overlay">
          <a routerLink="/" class="visual-brand">NobleStep</a>
          <div class="visual-quote">
            <p>"El calzado perfecto<br>para cada momento."</p>
            <div class="quote-dots">
              <span class="dot active"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel: formulario -->
      <div class="login-form-panel">
        <div class="form-wrap">

          <!-- Back link -->
          <a routerLink="/" class="back-link">
            <i class="fi fi-rr-arrow-left"></i> Volver a la tienda
          </a>

          <!-- Header -->
          <div class="form-header">
            <h1>{{ isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta' }}</h1>
            <p>{{ isLogin ? 'Ingresa tus datos para continuar' : 'Únete a miles de clientes satisfechos' }}</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form" autocomplete="on">

            <div class="field-group" *ngIf="!isLogin">
              <label for="fullName">
                <i class="fi fi-rr-user"></i> Nombre completo
              </label>
              <input type="text" id="fullName" [(ngModel)]="formData.fullName" name="fullName" placeholder="Juan Pérez" required />
            </div>

            <div class="field-group">
              <label for="email">
                <i class="fi fi-rr-envelope"></i> Correo electrónico
              </label>
              <input type="email" id="email" [(ngModel)]="formData.email" name="email" placeholder="tu@email.com" required autocomplete="email" />
            </div>

            <div class="field-group" *ngIf="!isLogin">
              <label for="phone">
                <i class="fi fi-rr-phone-call"></i> Teléfono <span class="optional">(opcional)</span>
              </label>
              <input type="tel" id="phone" [(ngModel)]="formData.phone" name="phone" placeholder="999 999 999" />
            </div>

            <div class="field-group">
              <label for="password">
                <i class="fi fi-rr-lock"></i> Contraseña
              </label>
              <input type="password" id="password" [(ngModel)]="formData.password" name="password" placeholder="••••••••" required autocomplete="current-password" maxlength="128" />
              <a *ngIf="isLogin" class="forgot-link" (click)="showForgotPassword = true">¿Olvidaste tu contraseña?</a>
            </div>

            <div class="field-group" *ngIf="!isLogin">
              <label for="confirmPassword">
                <i class="fi fi-rr-lock"></i> Confirmar contraseña
              </label>
              <input type="password" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="••••••••" required maxlength="128" />
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading">
              <span *ngIf="!loading">
                <i class="fi fi-rr-sign-in-alt"></i>
                {{ isLogin ? 'Iniciar sesión' : 'Crear cuenta' }}
              </span>
              <span *ngIf="loading" class="spinner"></span>
            </button>

            <div class="divider"><span>o</span></div>

            <button type="button" class="btn-guest" (click)="continueAsGuest()">
              <i class="fi fi-rr-shopping-bag"></i> Continuar sin cuenta
            </button>

            <p class="toggle-text">
              {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
              <a (click)="toggleMode()" class="toggle-link">
                {{ isLogin ? 'Regístrate gratis' : 'Inicia sesión' }}
              </a>
            </p>

          </form>
        </div>
      </div>

      <!-- Modal recuperar contraseña -->
      <div class="modal-backdrop" *ngIf="showForgotPassword" (click)="showForgotPassword = false">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h2>Recuperar contraseña</h2>
            <button (click)="showForgotPassword = false"><i class="fi fi-rr-cross"></i></button>
          </div>
          <p>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
          <div class="field-group">
            <label><i class="fi fi-rr-envelope"></i> Correo electrónico</label>
            <input type="email" [(ngModel)]="resetEmail" placeholder="tu@email.com" />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showForgotPassword = false">Cancelar</button>
            <button class="btn-submit" (click)="sendResetEmail()" [disabled]="loading">
              {{ loading ? 'Enviando...' : 'Enviar enlace' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    /* ---- LEFT VISUAL ---- */
    .login-visual {
      position: relative;
      overflow: hidden;
    }
    .visual-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .visual-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5rem;
    }
    .visual-brand {
      font-size: 2rem;
      font-weight: 800;
      font-style: italic;
      color: #fff;
      text-decoration: none;
      letter-spacing: -1px;
    }
    .visual-quote p {
      font-size: 1.6rem;
      font-weight: 600;
      color: #fff;
      line-height: 1.4;
      margin: 0 0 1rem;
    }
    .quote-dots { display: flex; gap: 6px; }
    .quote-dots .dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
    }
    .quote-dots .dot.active { background: #fff; }

    /* ---- RIGHT FORM ---- */
    .login-form-panel {
      background: #f7f4f0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
    }
    .form-wrap {
      width: 100%;
      max-width: 420px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: #666;
      text-decoration: none;
      margin-bottom: 2rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: #1a1a1a; }
    .form-header { margin-bottom: 2rem; }
    .form-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 0.4rem;
      letter-spacing: -0.5px;
    }
    .form-header p { font-size: 0.9rem; color: #888; margin: 0; }

    /* Fields */
    .field-group { margin-bottom: 1.25rem; position: relative; }
    .field-group label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #555;
      margin-bottom: 0.5rem;
    }
    .optional { font-weight: 400; text-transform: none; color: #aaa; font-size: 0.75rem; }
    .field-group input {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1.5px solid #e0dbd3;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #1a1a1a;
      background: #fff;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .field-group input:focus {
      outline: none;
      border-color: #1a1a1a;
      box-shadow: 0 0 0 3px rgba(26,26,26,0.07);
    }
    .forgot-link {
      display: block;
      text-align: right;
      font-size: 0.8rem;
      color: #888;
      cursor: pointer;
      margin-top: 0.4rem;
      text-decoration: underline;
    }
    .forgot-link:hover { color: #1a1a1a; }

    /* Buttons */
    .btn-submit {
      width: 100%;
      padding: 0.9rem;
      background: #1a1a1a;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s, transform 0.2s;
      font-family: inherit;
      margin-top: 0.5rem;
    }
    .btn-submit:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .divider {
      text-align: center;
      margin: 1.25rem 0;
      position: relative;
    }
    .divider::before {
      content: '';
      position: absolute;
      top: 50%; left: 0; right: 0;
      height: 1px;
      background: #e0dbd3;
    }
    .divider span {
      position: relative;
      background: #f7f4f0;
      padding: 0 0.75rem;
      font-size: 0.8rem;
      color: #aaa;
    }

    .btn-guest {
      width: 100%;
      padding: 0.85rem;
      background: transparent;
      color: #1a1a1a;
      border: 1.5px solid #e0dbd3;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s, border-color 0.2s;
      font-family: inherit;
    }
    .btn-guest:hover { background: #fff; border-color: #1a1a1a; }

    .toggle-text {
      text-align: center;
      font-size: 0.85rem;
      color: #888;
      margin: 1.25rem 0 0;
    }
    .toggle-link {
      color: #1a1a1a;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }

    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; padding: 1rem;
    }
    .modal-box {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .modal-head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
    }
    .modal-head h2 { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0; }
    .modal-head button { background: none; border: none; cursor: pointer; font-size: 1rem; color: #888; }
    .modal-box p { font-size: 0.9rem; color: #666; margin: 0 0 1.25rem; }
    .modal-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
    .btn-cancel {
      flex: 1; padding: 0.8rem; background: #f7f4f0;
      border: 1.5px solid #e0dbd3; border-radius: 10px;
      font-size: 0.9rem; cursor: pointer; font-family: inherit; font-weight: 500;
    }
    .modal-actions .btn-submit { flex: 1; margin-top: 0; }

    /* Responsive */
    @media (max-width: 768px) {
      .login-page { grid-template-columns: 1fr; }
      .login-visual { display: none; }
      .login-form-panel { padding: 2rem 1.25rem; }
    }

  `]
})
export class LoginComponent implements OnInit {
  isLogin = true;
  loading = false;
  showForgotPassword = false;
  resetEmail = '';
  confirmPassword = '';
  returnUrl = '/';

  formData = {
    email: '',
    password: '',
    fullName: '',
    phone: ''
  };

  constructor(
    private authService: EcommerceAuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/account']);
      return;
    }

    // Obtener URL de retorno — validar que sea ruta relativa para evitar open redirect
    const rawReturnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // Solo permitir rutas relativas (deben empezar con '/')
    this.returnUrl = rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//') ? rawReturnUrl : '/';
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.confirmPassword = '';
  }

  onSubmit() {
    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  login() {
    if (!this.formData.email || !this.formData.password) {
      this.notificationService.warning('Por favor completa todos los campos');
      return;
    }

    this.loading = true;
    this.authService.login({
      email: this.formData.email,
      password: this.formData.password
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success('¡Bienvenido de vuelta!');
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(error.error?.message || 'Error al iniciar sesión');
      }
    });
  }

  register() {
    if (!this.formData.email || !this.formData.password || !this.formData.fullName) {
      this.notificationService.warning('Por favor completa todos los campos obligatorios');
      return;
    }

    if (this.formData.password.length < 6) {
      this.notificationService.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.formData.password.length > 128) {
      this.notificationService.warning('La contraseña no puede superar los 128 caracteres');
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.notificationService.warning('Las contraseñas no coinciden');
      return;
    }

    this.loading = true;
    this.authService.register({
      email: this.formData.email,
      password: this.formData.password,
      fullName: this.formData.fullName,
      phone: this.formData.phone
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success('¡Cuenta creada exitosamente!');
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(error.error?.message || 'Error al crear la cuenta');
      }
    });
  }

  sendResetEmail() {
    if (!this.resetEmail) {
      this.notificationService.warning('Por favor ingresa tu correo electrónico');
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.resetEmail).subscribe({
      next: (response) => {
        this.loading = false;
        this.showForgotPassword = false;
        this.notificationService.success('Revisa tu correo electrónico para restablecer tu contraseña');
        this.resetEmail = '';
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Error al enviar el correo');
      }
    });
  }

  continueAsGuest() {
    // Si vino desde checkout u otra ruta protegida, regresar allí; si no, al catálogo
    const destination = this.returnUrl && this.returnUrl !== '/' ? this.returnUrl : '/catalog';
    this.router.navigate([destination]);
  }
}
