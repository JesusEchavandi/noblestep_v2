import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-gallery">
      <!-- Main Image -->
      <div class="main-image-container" (mouseenter)="showZoom = true" (mouseleave)="showZoom = false" (mousemove)="onMouseMove($event)">
        <img [src]="currentImage" [alt]="altText" class="main-image" #mainImage>
        
        <!-- Zoom Lens -->
        @if (showZoom) {
          <div class="zoom-lens" [style.left.px]="lensX" [style.top.px]="lensY"></div>
        }
        
        <!-- Lightbox Button -->
        <button class="lightbox-btn" (click)="openLightbox()" title="Ver en pantalla completa">
          🔍
        </button>
      </div>

      <!-- Zoom Result -->
      @if (showZoom) {
        <div class="zoom-result" [style.background-image]="'url(' + currentImage + ')'" 
             [style.background-position]="backgroundPosition"></div>
      }

      <!-- Thumbnails -->
      @if (images.length > 1) {
        <div class="thumbnails">
          @for (image of images; track image; let i = $index) {
            <button class="thumbnail" 
                    [class.active]="currentImage === image"
                    (click)="selectImage(image)">
              <img [src]="image" [alt]="altText + ' - vista ' + (i + 1)">
            </button>
          }
        </div>
      }

      <!-- Lightbox Modal -->
      @if (lightboxOpen) {
        <div class="lightbox-overlay" (click)="closeLightbox()">
          <div class="lightbox-content" (click)="$event.stopPropagation()">
            <button class="lightbox-close" (click)="closeLightbox()">×</button>
            <img [src]="currentImage" [alt]="altText" class="lightbox-image">
            
            @if (images.length > 1) {
              <button class="lightbox-nav prev" (click)="prevImage()">‹</button>
              <button class="lightbox-nav next" (click)="nextImage()">›</button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .image-gallery {
      position: relative;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      background: var(--color-background);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: zoom-in;
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .zoom-lens {
      position: absolute;
      width: 150px;
      height: 150px;
      border: 2px solid var(--color-primary);
      background: rgba(232, 74, 95, 0.1);
      pointer-events: none;
      border-radius: var(--radius-sm);
    }

    .zoom-result {
      position: absolute;
      right: -420px;
      top: 0;
      width: 400px;
      height: 400px;
      border: 2px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      background-repeat: no-repeat;
      background-color: var(--color-white);
      box-shadow: var(--shadow-xl);
      z-index: 100;
    }

    .lightbox-btn {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      width: 40px;
      height: 40px;
      background: var(--color-white);
      border: none;
      border-radius: var(--radius-full);
      cursor: pointer;
      font-size: var(--font-size-lg);
      box-shadow: var(--shadow-md);
      transition: var(--transition-base);
      z-index: 10;
    }

    .lightbox-btn:hover {
      background: var(--color-primary);
      transform: scale(1.1);
    }

    .thumbnails {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      overflow-x: auto;
      padding: var(--spacing-xs);
    }

    .thumbnail {
      flex: 0 0 80px;
      height: 80px;
      border: 2px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      background: var(--color-white);
      padding: var(--spacing-xs);
      transition: var(--transition-base);
    }

    .thumbnail:hover {
      border-color: var(--color-secondary);
      transform: scale(1.05);
    }

    .thumbnail.active {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(232, 74, 95, 0.2);
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Lightbox */
    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      animation: zoomIn 0.3s ease-out;
    }

    @keyframes zoomIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .lightbox-image {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }

    .lightbox-close {
      position: absolute;
      top: -50px;
      right: 0;
      width: 40px;
      height: 40px;
      background: var(--color-white);
      border: none;
      border-radius: var(--radius-full);
      font-size: var(--font-size-3xl);
      cursor: pointer;
      color: var(--color-dark);
      transition: var(--transition-base);
    }

    .lightbox-close:hover {
      background: var(--color-primary);
      color: var(--color-white);
      transform: rotate(90deg);
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: var(--radius-full);
      font-size: var(--font-size-3xl);
      cursor: pointer;
      transition: var(--transition-base);
    }

    .lightbox-nav:hover {
      background: var(--color-white);
      transform: translateY(-50%) scale(1.1);
    }

    .lightbox-nav.prev {
      left: -70px;
    }

    .lightbox-nav.next {
      right: -70px;
    }

    @media (max-width: 768px) {
      .zoom-result {
        display: none;
      }

      .lightbox-nav {
        width: 40px;
        height: 40px;
      }

      .lightbox-nav.prev {
        left: 10px;
      }

      .lightbox-nav.next {
        right: 10px;
      }
    }
  `]
})
export class ImageGalleryComponent {
  @Input() images: string[] = ['/assets/placeholder-product.png'];
  @Input() altText: string = 'Producto';

  currentImage: string = '';
  showZoom: boolean = false;
  lightboxOpen: boolean = false;
  lensX: number = 0;
  lensY: number = 0;
  backgroundPosition: string = '0% 0%';

  ngOnInit() {
    this.currentImage = this.images[0] || '/assets/placeholder-product.png';
  }

  selectImage(image: string) {
    this.currentImage = image;
  }

  onMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Lens position
    this.lensX = x - 75;
    this.lensY = y - 75;

    // Background position for zoom
    const bgPosX = (x / rect.width) * 100;
    const bgPosY = (y / rect.height) * 100;
    this.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
  }

  openLightbox() {
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  prevImage() {
    const currentIndex = this.images.indexOf(this.currentImage);
    const prevIndex = currentIndex === 0 ? this.images.length - 1 : currentIndex - 1;
    this.currentImage = this.images[prevIndex];
  }

  nextImage() {
    const currentIndex = this.images.indexOf(this.currentImage);
    const nextIndex = (currentIndex + 1) % this.images.length;
    this.currentImage = this.images[nextIndex];
  }
}
