import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Slide {
  id: number;
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgImage: string;
  overlayColor: string;
  infoIcon: string;
  infoLabel: string;
  infoValue: string;
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero-slider" (mouseenter)="stopAutoplay()" (mouseleave)="startAutoplay()">
      <div class="slides-container">
        @for (slide of slides; track slide.id; let i = $index) {
          <div class="slide" [class.active]="currentSlide === i">
            <!-- Background image layer -->
            <div class="slide-bg" [style.background-image]="'url(' + slide.bgImage + ')'"></div>
            <div class="slide-overlay" [style.background]="slide.overlayColor"></div>

            <!-- Content -->
            <div class="slide-content">
              <div class="text-content">
                <span class="badge-label">{{ slide.subtitle }}</span>
                <h1 class="title">{{ slide.titleLine1 }} <em>{{ slide.titleLine2 }}</em> {{ slide.titleLine3 }}</h1>
                <p class="description">{{ slide.description }}</p>
                <a [routerLink]="slide.buttonLink" class="cta-button">
                  {{ slide.buttonText }} <span class="arrow">→</span>
                </a>
              </div>
              <!-- Info card -->
              <div class="info-card">
                <div class="info-icon">{{ slide.infoIcon }}</div>
                <div class="info-text">
                  <span class="info-label">{{ slide.infoLabel }}</span>
                  <span class="info-value">{{ slide.infoValue }}</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Arrows -->
      <button class="nav-btn prev" (click)="prevSlide()" aria-label="Anterior">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="nav-btn next" (click)="nextSlide()" aria-label="Siguiente">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <!-- Dots -->
      <div class="dots">
        @for (slide of slides; track slide.id; let i = $index) {
          <button class="dot" [class.active]="currentSlide === i" (click)="goToSlide(i)" [attr.aria-label]="'Slide ' + (i+1)"></button>
        }
      </div>
    </div>
  `,
  styles: [`
    .hero-slider {
      position: relative;
      width: 100%;
      height: 560px;
      overflow: hidden;
      background: #1a1a1a;
    }

    .slides-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.9s ease-in-out;
    }

    .slide.active {
      opacity: 1;
      z-index: 1;
    }

    /* Background image */
    .slide-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      transform: scale(1.04);
      transition: transform 6s ease-out;
    }

    .slide.active .slide-bg {
      transform: scale(1);
    }

    /* Overlay */
    .slide-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    /* Content */
    .slide-content {
      position: relative;
      z-index: 2;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
      height: 100%;
      display: flex;
      align-items: flex-end;
      padding-bottom: 80px;
      gap: var(--spacing-xl);
    }

    .text-content {
      flex: 1;
      color: var(--color-white);
    }

    .badge-label {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.3);
      color: var(--color-white);
      font-size: var(--font-size-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      padding: 0.3rem 0.8rem;
      border-radius: var(--radius-full);
      margin-bottom: var(--spacing-md);
    }

    .title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: var(--spacing-md);
      color: var(--color-white);
      text-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }

    .title em {
      font-style: italic;
      color: var(--color-cream);
    }

    .description {
      font-size: var(--font-size-base);
      color: rgba(255,255,255,0.85);
      margin-bottom: var(--spacing-xl);
      max-width: 420px;
      line-height: 1.6;
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      background: var(--color-white);
      color: var(--color-dark);
      padding: 0.8rem 1.8rem;
      border-radius: var(--radius-full);
      text-decoration: none;
      font-weight: 700;
      font-size: var(--font-size-sm);
      transition: var(--transition-base);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .cta-button:hover {
      background: var(--color-cream);
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.25);
    }

    .arrow { transition: transform var(--transition-base); }
    .cta-button:hover .arrow { transform: translateX(4px); }

    /* Info card — bottom right */
    .info-card {
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 16px;
      padding: 1rem 1.4rem;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      color: var(--color-white);
      min-width: 200px;
      align-self: flex-end;
    }

    .info-icon { font-size: 2rem; }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-label {
      font-size: var(--font-size-xs);
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .info-value {
      font-size: var(--font-size-2xl);
      font-weight: 800;
      letter-spacing: -1px;
    }

    /* Arrows */
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.9);
      color: var(--color-dark);
      border: none;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-full);
      cursor: pointer;
      z-index: 10;
      transition: var(--transition-base);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .nav-btn:hover {
      background: var(--color-white);
      transform: translateY(-50%) scale(1.08);
    }

    .nav-btn.prev { left: var(--spacing-xl); }
    .nav-btn.next { right: var(--spacing-xl); }

    /* Dots */
    .dots {
      position: absolute;
      bottom: var(--spacing-xl);
      right: var(--spacing-xl);
      display: flex;
      gap: var(--spacing-sm);
      z-index: 10;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
      background: rgba(255,255,255,0.4);
      border: none;
      cursor: pointer;
      transition: var(--transition-base);
      padding: 0;
    }

    .dot.active {
      background: var(--color-white);
      width: 28px;
    }

    /* Responsive */

    /* Laptop 1366px */
    @media (max-width: 1399px) {
      .hero-slider { height: 500px; }
      .title { font-size: clamp(1.8rem, 4vw, 2.5rem); }
      .slide-content { max-width: 100%; padding: 0 1.5rem 80px; }
      .description { font-size: var(--font-size-sm); }
      .cta-button { padding: 0.7rem 1.5rem; font-size: var(--font-size-sm); }
      .badge-label { font-size: 0.68rem; }
      .nav-btn { width: 38px; height: 38px; }
    }

    /* QHD 2560x1440 */
    @media (min-width: 1920px) {
      .hero-slider { height: 680px; }
      .title { font-size: clamp(2.5rem, 4vw, 3.5rem); }
      .description { font-size: var(--font-size-lg); max-width: 600px; }
      .cta-button { padding: 1rem 2.5rem; font-size: var(--font-size-base); }
      .info-card { padding: 2rem; }
      .badge-label { font-size: 0.82rem; padding: 0.4rem 1rem; }
      .nav-btn { width: 52px; height: 52px; }
      .dot { width: 10px; height: 10px; }
      .dot.active { width: 36px; }
    }

    @media (max-width: 768px) {
      .hero-slider { height: 420px; }
      .slide-content { padding-bottom: 60px; flex-direction: column; align-items: flex-start; }
      .info-card { display: none; }
      .title { font-size: clamp(1.6rem, 6vw, 2.5rem); }
      .description { font-size: var(--font-size-sm); max-width: 100%; }
      .nav-btn.prev { left: var(--spacing-md); }
      .nav-btn.next { right: var(--spacing-md); }
      .dots { right: 50%; transform: translateX(50%); }
    }

    @media (max-width: 480px) {
      .hero-slider { height: 320px; }
      .slide-content { padding: 0 var(--spacing-md) 40px; }
      .badge-label { font-size: 0.65rem; padding: 0.25rem 0.6rem; }
      .description { display: none; }
      .cta-button { padding: 0.65rem 1.3rem; font-size: var(--font-size-xs); }
      .nav-btn { width: 36px; height: 36px; }
    }

    @media (max-width: 360px) {
      .hero-slider { height: 280px; }
      .slide-content { padding: 0 var(--spacing-sm) 36px; }
      .title { font-size: clamp(1.3rem, 7vw, 1.8rem); }
      .nav-btn { display: none; }
    }
  `]
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  autoplayInterval: any;

  slides: Slide[] = [
    {
      id: 1,
      subtitle: 'Nueva Colección 2026',
      titleLine1: 'Calzado',
      titleLine2: 'Premium',
      titleLine3: 'para cada paso',
      description: 'Descubre nuestra colección exclusiva de zapatos y zapatillas con diseño, confort y calidad insuperables.',
      buttonText: 'Shop now',
      buttonLink: '/catalog',
      bgImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80',
      overlayColor: 'linear-gradient(to right, rgba(42,54,59,0.82) 40%, rgba(42,54,59,0.2) 100%)',
      infoIcon: '⭐',
      infoLabel: 'Satisfacción',
      infoValue: '98%'
    },
    {
      id: 2,
      subtitle: 'Hasta 50% de descuento',
      titleLine1: 'Ofertas',
      titleLine2: 'Especiales',
      titleLine3: 'por tiempo limitado',
      description: 'Aprovecha nuestras promociones en las mejores marcas de calzado. ¡Solo por esta semana!',
      buttonText: 'Ver ofertas',
      buttonLink: '/catalog',
      bgImage: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1400&q=80',
      overlayColor: 'linear-gradient(to right, rgba(232,74,95,0.80) 35%, rgba(232,74,95,0.15) 100%)',
      infoIcon: '🏷️',
      infoLabel: 'Descuento máximo',
      infoValue: '50%'
    },
    {
      id: 3,
      subtitle: 'Envío gratis desde S/ 100',
      titleLine1: 'Estilo y',
      titleLine2: 'Confort',
      titleLine3: 'en cada talla',
      description: 'Recibe tus zapatos favoritos en la puerta de tu casa. Envío rápido a Lima y provincias.',
      buttonText: 'Comprar ahora',
      buttonLink: '/catalog',
      bgImage: 'https://images.unsplash.com/photo-1518894781321-630e638d0742?w=1400&q=80',
      overlayColor: 'linear-gradient(to right, rgba(42,54,59,0.78) 38%, rgba(42,54,59,0.1) 100%)',
      infoIcon: '🚚',
      infoLabel: 'Entrega en',
      infoValue: '24h'
    }
  ];

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoplay();
    this.startAutoplay();
  }
}
