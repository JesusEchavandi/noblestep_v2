import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../services/shop.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { MetaService } from '../../services/meta.service';
import { Producto } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, SlicePipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  producto: Producto | null = null;
  cargando = true;
  error = false;
  cantidad = 1;
  tallaSeleccionada: string | null = null;
  varianteSeleccionadaId: number | null = null;
  productosRelacionados: Producto[] = [];

  // Galería
  imagenesGaleria: string[] = [];
  indiceImagenActiva = 0;
  lightboxAbierto = false;
  zoomActivo = false;

  private readonly WSP_NUMBER = '51999999999'; // ← Reemplaza con tu número real

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private metaService: MetaService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.indiceImagenActiva = 0;
      this.lightboxAbierto = false;
      this.cantidad = 1;
      this.tallaSeleccionada = null;
      this.cargarProducto(id);
    });
  }

  cargarProducto(id: number) {
    this.cargando = true;
    this.error = false;

    this.shopService.obtenerProducto(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.cargando = false;
        // Si el producto tiene variantes del backend, usarlas
        // Si no (legacy), parsear el campo size como talla única
        const tieneVariantes = producto.tallas && producto.tallas.length > 0;
        if (!tieneVariantes && producto.talla) {
          // Compatibilidad legacy: convertir campo size a variante ficticia
          producto.tallas = [{ varianteId: 0, talla: producto.talla, stock: producto.stock, disponible: producto.stock > 0 }];
        }
        // Auto-seleccionar si solo hay una talla disponible
        const disponibles = (producto.tallas || []).filter(s => s.disponible);
        if (disponibles.length === 1) {
          this.tallaSeleccionada = disponibles[0].talla;
          this.varianteSeleccionadaId = disponibles[0].varianteId || null;
        }
        this.imagenesGaleria = this.construirGaleria(producto);

        this.metaService.establecerMetaProducto({
          nombre: producto.nombre,
          descripcion: producto.descripcion || producto.nombreCategoria,
          precioVenta: producto.precioVenta,
          urlImagen: producto.urlImagen
        });

        // Cargar productos relacionados
        this.shopService.obtenerProductos(producto.categoriaId).subscribe({
          next: (res: any) => {
            const items = res.items || res;
            this.productosRelacionados = items.filter((p: Producto) => p.id !== producto.id).slice(0, 4);
          },
          error: () => {}
        });
      },
      error: () => {
        this.cargando = false;
        this.error = true;
      }
    });
  }

  // Construye galería de 4 ángulos con imagen real del producto
  construirGaleria(producto: Producto): string[] {
    const base = producto.urlImagen || this.obtenerImagenProducto(producto);
    // Si tiene imagen real del admin usarla como principal
    // Generar variaciones con parámetros Unsplash para simular ángulos
    const nombre = (producto.nombre || '').toLowerCase();
    const imgs = this.obtenerGaleriaPorNombre(nombre, producto.id);
    if (producto.urlImagen) imgs[0] = producto.urlImagen;
    return imgs;
  }

  obtenerGaleriaPorNombre(nombre: string, id: number): string[] {
    const sneakerImgs = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961d61f?w=700&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=700&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=700&q=80'
    ];
    const formalImgs = [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=700&q=80',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=700&q=80',
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=700&q=80',
      'https://images.unsplash.com/photo-1618898909019-010e4e234c55?w=700&q=80'
    ];
    const bootImgs = [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=700&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
      'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=700&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=700&q=80'
    ];
    const sandalImgs = [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=700&q=80',
      'https://images.unsplash.com/photo-1572782252655-9c53bf0b7b04?w=700&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80'
    ];
    const sportImgs = [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=700&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=700&q=80'
    ];
    if (nombre.includes('boot') || nombre.includes('bota')) return bootImgs;
    if (nombre.includes('sandal') || nombre.includes('sandalia')) return sandalImgs;
    if (nombre.includes('formal') || nombre.includes('oxford') || nombre.includes('vestir')) return formalImgs;
    if (nombre.includes('sport') || nombre.includes('gym') || nombre.includes('running')) return sportImgs;
    if (nombre.includes('sneaker') || nombre.includes('zapatilla') || nombre.includes('casual')) return sneakerImgs;
    const allSets = [sneakerImgs, formalImgs, bootImgs, sandalImgs, sportImgs];
    return allSets[id % allSets.length];
  }

  obtenerImagenProducto(producto: Producto): string {
    if (producto.urlImagen) return producto.urlImagen;
    const nombre = (producto.nombre || '').toLowerCase();
    const map: { [key: string]: string } = {
      'sneaker': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'zapatilla': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'running': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'formal': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
      'oxford': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
      'bota': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
      'sandalia': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
      'sport': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'casual': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
    };
    for (const key of Object.keys(map)) {
      if (nombre.includes(key)) return map[key];
    }
    const fallbacks = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
    ];
    return fallbacks[producto.id % fallbacks.length];
  }

  setActiveImage(i: number) { this.indiceImagenActiva = i; }

  nextImage() {
    this.indiceImagenActiva = (this.indiceImagenActiva + 1) % this.imagenesGaleria.length;
  }

  prevImage() {
    this.indiceImagenActiva = (this.indiceImagenActiva - 1 + this.imagenesGaleria.length) % this.imagenesGaleria.length;
  }

  openLightbox() { this.lightboxAbierto = true; }
  closeLightbox() { this.lightboxAbierto = false; }

  onZoomMove(e: MouseEvent) { /* zoom futuro */ }

  obtenerPorcentajeDescuento(): number {
    if (!this.producto || !this.producto.precioVenta || this.producto.precioVenta >= this.producto.precio) return 0;
    return Math.round((1 - this.producto.precioVenta / this.producto.precio) * 100);
  }

  seleccionarTalla(talla: string, varianteId: number) {
    this.tallaSeleccionada = talla;
    this.varianteSeleccionadaId = varianteId || null;
  }

  obtenerVarianteSeleccionada() {
    if (!this.producto || !this.tallaSeleccionada) return null;
    return (this.producto.tallas || []).find(s => s.talla === this.tallaSeleccionada) ?? null;
  }

  obtenerStockSeleccionado(): number {
    const variante = this.obtenerVarianteSeleccionada();
    return variante ? variante.stock : (this.producto?.stock ?? 0);
  }

  aumentarCantidad() {
    const maxStock = this.obtenerStockSeleccionado();
    if (this.cantidad < maxStock) {
      this.cantidad++;
    } else {
      this.notificationService.warning(`Stock máximo disponible: ${maxStock}`);
    }
  }

  disminuirCantidad() {
    if (this.cantidad > 1) this.cantidad--;
  }

  agregarAlCarrito() {
    if (!this.producto) return;
    const tieneVariantes = this.producto.tallas && this.producto.tallas.filter(s => s.disponible).length > 0;
    if (tieneVariantes && !this.tallaSeleccionada) {
      this.notificationService.warning('Selecciona una talla para continuar');
      return;
    }
    const variante = this.obtenerVarianteSeleccionada();
    const resultado = this.cartService.agregarAlCarrito(
      this.producto,
      this.cantidad,
      variante && variante.varianteId ? variante : undefined
    );
    if (resultado.success) {
      const label = this.tallaSeleccionada ? ` — Talla ${this.tallaSeleccionada}` : '';
      this.notificationService.success(`✓ ${this.cantidad}x ${this.producto.nombre}${label} agregado al carrito`);
      this.cantidad = 1;
    } else {
      this.notificationService.error(resultado.message);
    }
  }

  consultarPorWsp() {
    if (!this.producto) return;
    const msg = `¡Hola! Estoy interesado en:\n\n👟 *${this.producto.nombre}*\n💰 Precio: S/ ${(this.producto.precioVenta || this.producto.precio).toFixed(2)}${this.tallaSeleccionada ? `\n📏 Talla: ${this.tallaSeleccionada}` : ''}\n\n¿Tienen disponibilidad y cómo coordino el envío?`;
    window.open(`https://wa.me/${this.WSP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  esTallaSeleccionada(talla: string): boolean {
    return this.tallaSeleccionada === talla;
  }
}
