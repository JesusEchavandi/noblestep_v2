import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../../services/shop.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { MetaService } from '../../services/meta.service';
import { Producto } from '../../models/product.model';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { TrustBadgesComponent } from '../../components/trust-badges/trust-badges.component';
import { CategoryGridComponent } from '../../components/category-grid/category-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterModule,
    HeroSliderComponent,
    TrustBadgesComponent,
    CategoryGridComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  productosDestacados: Producto[] = [];
  cargando = true;

  @ViewChild('productsGrid') productsGridRef?: ElementRef;

  constructor(
    private shopService: ShopService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private metaService: MetaService
  ) {}

  ngOnInit() {
    this.metaService.actualizarMetaEtiquetas({
      titulo: 'NobleStep — Calzado Premium',
      descripcion: 'Descubre nuestra colección de calzado premium. Zapatos, zapatillas y más con envío gratis en compras mayores a S/100.',
      tipo: 'website'
    });
    this.cargarProductosDestacados();
  }

  cargarProductosDestacados() {
    this.cargando = true;
    this.shopService.obtenerProductos(undefined, undefined, undefined, undefined, 1, 8).subscribe({
      next: (response: any) => {
        const lista = response.items || (Array.isArray(response) ? response : []);
        this.productosDestacados = lista.slice(0, 8);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.cargando = false;
      }
    });
  }

  agregarAlCarrito(producto: Producto) {
    const resultado = this.cartService.agregarAlCarrito(producto);
    if (resultado.success) {
      this.notificationService.success(`✓ ${producto.nombre} agregado al carrito`);
    } else {
      this.notificationService.error(resultado.message);
    }
  }

  scrollGrid(direction: number) {
    const grid = this.productsGridRef?.nativeElement;
    if (grid) {
      grid.scrollBy({ left: direction * 280, behavior: 'smooth' });
    }
  }

  esNuevo(producto: Producto): boolean {
    if (!producto.creadoEn) return false;
    const haceTreintaDias = new Date();
    haceTreintaDias.setDate(haceTreintaDias.getDate() - 30);
    return new Date(producto.creadoEn) > haceTreintaDias;
  }

  esBajoStock(producto: Producto): boolean {
    return producto.stock > 0 && producto.stock < 5;
  }

  obtenerImagenProducto(producto: Producto): string {
    if (producto.urlImagen) return producto.urlImagen;
    const n = (producto.nombre + ' ' + (producto.nombreCategoria || '')).toLowerCase();
    if (n.includes('running') || n.includes('runner')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
    if (n.includes('sneaker') || n.includes('zapatilla')) return 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80';
    if (n.includes('formal') || n.includes('oxford') || n.includes('vestir') || n.includes('clásic')) return 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80';
    if (n.includes('bota') || n.includes('boot') || n.includes('botín')) return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80';
    if (n.includes('sandalia') || n.includes('sandal') || n.includes('ojotas')) return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80';
    if (n.includes('casual') || n.includes('loafer') || n.includes('mocasin') || n.includes('slip')) return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80';
    if (n.includes('sport') || n.includes('gym') || n.includes('training') || n.includes('deportiv')) return 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80';
    if (n.includes('tacon') || n.includes('tacón') || n.includes('heel') || n.includes('stiletto')) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80';
    if (n.includes('niño') || n.includes('kids') || n.includes('infantil') || n.includes('bebe')) return 'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&q=80';
    if (n.includes('cuero') || n.includes('leather') || n.includes('piel')) return 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80';
    if (n.includes('plataforma') || n.includes('platform')) return 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80';
    if (n.includes('balerin') || n.includes('flat') || n.includes('mule')) return 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80';
    const fallbacks = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
    ];
    return fallbacks[producto.id % fallbacks.length];
  }
}
