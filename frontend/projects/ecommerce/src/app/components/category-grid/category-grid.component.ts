import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="category-section">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">Explora por Categorías</h2>
          <p class="section-sub">Encuentra el calzado ideal para cada ocasión</p>
        </div>
        <div class="category-grid">
          @for (category of categories; track category.id) {
            <a [routerLink]="['/catalog']" [queryParams]="{category: category.id}" class="category-card">
              <div class="cat-bg" [style.background]="getBgColor($index)"></div>
              <div class="cat-img-wrap">
                <img [src]="getCategoryImage(category.name)" [alt]="category.name" class="cat-img" loading="lazy" />
              </div>
              <div class="cat-body">
                <div class="cat-icon-wrap">
                  <i [class]="'fi ' + getFlaticon(category.name)"></i>
                </div>
                <div class="cat-info">
                  <h3 class="cat-name">{{ category.name }}</h3>
                  <p class="cat-count"><i class="fi fi-rr-box-alt"></i> {{ category.productCount }} productos</p>
                </div>
                <div class="cat-arrow">
                  <i class="fi fi-rr-arrow-right"></i>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .category-section {
      padding: 4rem 0;
      background: #f7f4f0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    .section-head {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.5px;
      margin: 0 0 0.5rem;
    }
    .section-sub {
      font-size: 0.95rem;
      color: #888;
      margin: 0;
    }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .category-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      background: #fff;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    .category-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.13);
    }
    .cat-bg {
      position: absolute;
      inset: 0;
      opacity: 0.08;
      transition: opacity 0.3s;
    }
    .category-card:hover .cat-bg { opacity: 0.14; }
    .cat-img-wrap {
      width: 100%;
      height: 180px;
      overflow: hidden;
      background: #f0ede8;
    }
    .cat-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .category-card:hover .cat-img { transform: scale(1.06); }
    .cat-body {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #fff;
      position: relative;
      z-index: 1;
    }
    .cat-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f0ede8;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.25rem;
      color: #1a1a1a;
      transition: background 0.3s;
    }
    .category-card:hover .cat-icon-wrap { background: #1a1a1a; color: #fff; }
    .cat-info { flex: 1; min-width: 0; }
    .cat-name {
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 0.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cat-count {
      font-size: 0.8rem;
      color: #999;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .cat-arrow {
      font-size: 1rem;
      color: #ccc;
      flex-shrink: 0;
      transition: color 0.3s, transform 0.3s;
    }
    .category-card:hover .cat-arrow { color: #1a1a1a; transform: translateX(4px); }
    @media (max-width: 768px) {
      .category-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      .cat-img-wrap { height: 130px; }
      .section-title { font-size: 1.5rem; }
    }
    @media (max-width: 480px) {
      .category-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CategoryGridComponent implements OnInit {
  categories: any[] = [];

  constructor(private shopService: ShopService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.shopService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.map((cat: any, index: number) => ({
          ...cat,
          icon: this.getCategoryIcon(index),
          productCount: Math.floor(Math.random() * 50) + 10 // Temporal
        }));
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  getCategoryIcon(index: number): string {
    const icons = ['fi-rr-boot', 'fi-rr-vest', 'fi-rr-running', 'fi-rr-gem', 'fi-rr-briefcase', 'fi-rr-backpack', 'fi-rr-glasses', 'fi-rr-headphones'];
    return icons[index % icons.length];
  }

  getFlaticon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('sneaker') || n.includes('zapatilla') || n.includes('running') || n.includes('sport')) return 'fi-rr-running';
    if (n.includes('formal') || n.includes('oxford') || n.includes('vestir')) return 'fi-rr-vest';
    if (n.includes('bota') || n.includes('boot')) return 'fi-rr-boot';
    if (n.includes('sandalia') || n.includes('sandal') || n.includes('verano')) return 'fi-rr-flip-flops';
    if (n.includes('casual') || n.includes('loafer') || n.includes('mocasin')) return 'fi-rr-shoe-prints';
    if (n.includes('niño') || n.includes('kids') || n.includes('infantil')) return 'fi-rr-child-head';
    if (n.includes('mujer') || n.includes('dama') || n.includes('tacon') || n.includes('tacón')) return 'fi-rr-high-heels';
    if (n.includes('hombre') || n.includes('caballero')) return 'fi-rr-user-tie';
    return 'fi-rr-shoe-prints';
  }

  getBgColor(index: number): string {
    const colors = ['#1a1a1a', '#99B898', '#E84A5F', '#FECEA8', '#2A363B', '#FF847C'];
    return colors[index % colors.length];
  }

  getCategoryImage(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('sneaker') || n.includes('zapatilla') || n.includes('running') || n.includes('sport')) {
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
    }
    if (n.includes('formal') || n.includes('oxford') || n.includes('vestir')) {
      return 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80';
    }
    if (n.includes('bota') || n.includes('boot')) {
      return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80';
    }
    if (n.includes('sandalia') || n.includes('sandal') || n.includes('verano')) {
      return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80';
    }
    if (n.includes('casual') || n.includes('loafer') || n.includes('mocasin')) {
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80';
    }
    if (n.includes('mujer') || n.includes('dama') || n.includes('tacon') || n.includes('tacón')) {
      return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80';
    }
    if (n.includes('hombre') || n.includes('caballero')) {
      return 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80';
    }
    if (n.includes('niño') || n.includes('kids') || n.includes('infantil')) {
      return 'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&q=80';
    }
    const defaults = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80',
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }
}
