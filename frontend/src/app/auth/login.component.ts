import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-5 col-lg-4">
            <div class="card login-card shadow-lg">
              <div class="card-body p-5">
                <div class="text-center mb-5">
                  <!-- Lock Animation -->
                  <div class="lock-container" [class.unlocking]="isUnlocking" [class.success]="showSuccessAnimation">
                    <svg class="lock-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <!-- Lock Body -->
                      <rect class="lock-body" x="30" y="50" width="40" height="35" rx="3" fill="var(--color-cream)"/>
                      
                      <!-- Lock Shackle (U shape) -->
                      <path class="lock-shackle lock-shackle-left" d="M 35 50 L 35 35 Q 35 20, 50 20" 
                            stroke="var(--color-cream)" stroke-width="5" fill="none" stroke-linecap="round"/>
                      <path class="lock-shackle lock-shackle-right" d="M 50 20 Q 65 20, 65 35 L 65 50" 
                            stroke="var(--color-cream)" stroke-width="5" fill="none" stroke-linecap="round"/>
                      
                      <!-- Keyhole -->
                      <circle class="keyhole" cx="50" cy="62" r="4" fill="var(--color-dark)"/>
                      <rect class="keyhole-slot" x="48" y="64" width="4" height="8" fill="var(--color-dark)"/>
                      
                      <!-- Success Checkmark -->
                      <polyline class="checkmark" points="40,67 47,74 60,61" 
                                stroke="var(--color-success)" stroke-width="4" fill="none" 
                                stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    
                    <!-- Particles Effect -->
                    <div class="particles">
                      <span class="particle" style="--angle: 0deg"></span>
                      <span class="particle" style="--angle: 45deg"></span>
                      <span class="particle" style="--angle: 90deg"></span>
                      <span class="particle" style="--angle: 135deg"></span>
                      <span class="particle" style="--angle: 180deg"></span>
                      <span class="particle" style="--angle: 225deg"></span>
                      <span class="particle" style="--angle: 270deg"></span>
                      <span class="particle" style="--angle: 315deg"></span>
                    </div>
                  </div>
                  
                  <h1 class="fw-bold mb-2 mt-4" style="color: var(--color-cream); font-size: 2.5rem;">NobleStep</h1>
                  <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.95rem;">Sistema de Gestión Empresarial</p>
                </div>

                <div *ngIf="errorMessage" class="alert alert-danger mb-4" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  {{ errorMessage }}
                </div>

                <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                  <div class="mb-4">
                    <label for="username" class="form-label" style="color: var(--color-text-inverse); font-weight: 500;">
                      <i class="bi bi-person-fill me-1"></i> Usuario
                    </label>
                    <input
                      type="text"
                      class="form-control form-control-lg"
                      id="username"
                      name="username"
                      [(ngModel)]="credentials.username"
                      required
                      placeholder="Ingrese su usuario"
                      style="background-color: rgba(255, 255, 255, 0.95); border: 2px solid var(--color-gray-200);"
                    />
                  </div>

                  <div class="mb-4">
                    <label for="password" class="form-label" style="color: var(--color-text-inverse); font-weight: 500;">
                      <i class="bi bi-lock-fill me-1"></i> Contraseña
                    </label>
                    <input
                      type="password"
                      class="form-control form-control-lg"
                      id="password"
                      name="password"
                      [(ngModel)]="credentials.password"
                      required
                      placeholder="Ingrese su contraseña"
                      style="background-color: rgba(255, 255, 255, 0.95); border: 2px solid var(--color-gray-200);"
                    />
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary btn-lg w-100 mt-3"
                    [disabled]="!loginForm.form.valid || loading"
                    style="font-weight: 600; padding: 0.875rem;"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!loading" class="bi bi-box-arrow-in-right me-2"></i>
                    {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-card {
      background: rgba(42, 54, 59, 0.95) !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    /* Lock Animation Container */
    .lock-container {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto;
      transition: all 0.6s ease;
    }

    .lock-icon {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 4px 8px rgba(254, 206, 168, 0.3));
      transition: all 0.4s ease;
    }

    /* Lock Body Animation */
    .lock-body {
      transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    /* Lock Shackle Animation */
    .lock-shackle {
      transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      transform-origin: center;
    }

    /* Keyhole Animation */
    .keyhole, .keyhole-slot {
      transition: opacity 0.3s ease;
    }

    /* Checkmark (hidden by default) */
    .checkmark {
      opacity: 0;
      stroke-dasharray: 50;
      stroke-dashoffset: 50;
      transition: all 0.6s ease;
    }

    /* Particles (hidden by default) */
    .particles {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      background: var(--color-cream);
      border-radius: 50%;
      opacity: 0;
      transform: translate(-50%, -50%);
    }

    /* UNLOCKING STATE - Lock opens */
    .lock-container.unlocking .lock-shackle-left {
      transform: rotate(-25deg);
      transform-origin: 35px 50px;
    }

    .lock-container.unlocking .lock-shackle-right {
      transform: rotate(25deg);
      transform-origin: 65px 50px;
    }

    .lock-container.unlocking .lock-body {
      transform: translateY(5px);
    }

    .lock-container.unlocking .lock-icon {
      transform: scale(1.1);
    }

    /* SUCCESS STATE - Show checkmark and particles */
    .lock-container.success .keyhole,
    .lock-container.success .keyhole-slot {
      opacity: 0;
    }

    .lock-container.success .checkmark {
      opacity: 1;
      stroke-dashoffset: 0;
      animation: checkmarkPulse 0.6s ease;
    }

    .lock-container.success .lock-icon {
      animation: successBounce 0.6s ease;
    }

    .lock-container.success .particle {
      animation: particleExplosion 0.8s ease-out forwards;
    }

    .lock-container.success .particle:nth-child(1) { animation-delay: 0s; }
    .lock-container.success .particle:nth-child(2) { animation-delay: 0.05s; }
    .lock-container.success .particle:nth-child(3) { animation-delay: 0.1s; }
    .lock-container.success .particle:nth-child(4) { animation-delay: 0.15s; }
    .lock-container.success .particle:nth-child(5) { animation-delay: 0.2s; }
    .lock-container.success .particle:nth-child(6) { animation-delay: 0.25s; }
    .lock-container.success .particle:nth-child(7) { animation-delay: 0.3s; }
    .lock-container.success .particle:nth-child(8) { animation-delay: 0.35s; }

    /* Animations */
    @keyframes checkmarkPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    @keyframes successBounce {
      0%, 100% { transform: scale(1.1); }
      50% { transform: scale(1.2); }
    }

    @keyframes particleExplosion {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) translateX(0) translateY(0);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) 
                   translateX(calc(cos(var(--angle)) * 60px)) 
                   translateY(calc(sin(var(--angle)) * 60px));
      }
    }

    /* Idle Animation - Slight pulse */
    .lock-container:not(.unlocking):not(.success) .lock-icon {
      animation: idlePulse 2s ease-in-out infinite;
    }

    @keyframes idlePulse {
      0%, 100% { 
        transform: scale(1);
        filter: drop-shadow(0 4px 8px rgba(254, 206, 168, 0.3));
      }
      50% { 
        transform: scale(1.05);
        filter: drop-shadow(0 6px 12px rgba(254, 206, 168, 0.5));
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  errorMessage = '';
  loading = false;
  isUnlocking = false;
  showSuccessAnimation = false;

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Trigger unlock animation
        this.isUnlocking = true;
        
        // Wait for unlock animation
        setTimeout(() => {
          this.showSuccessAnimation = true;
          
          // Navigate after success animation
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 800);
        }, 1200);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Usuario o contraseña inválidos';
        this.loading = false;
        this.isUnlocking = false;
      },
      complete: () => {
        // Don't set loading to false immediately if unlocking
        if (!this.isUnlocking) {
          this.loading = false;
        }
      }
    });
  }
}
