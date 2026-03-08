import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShopService, PaginatedResponse } from '../../services/shop.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { MetaService } from '../../services/meta.service';
import { Producto, Categoria } from '../../models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  cargando = true;
  filtrosAbiertos = false;
  mostrarVistaRapida = false;
  productoSeleccionado: Producto | null = null;
  
  // Filtros
  categoriaSeleccionadaId: number | null = null;
  terminoBusqueda = '';
  precioMinimo: number | null = null;
  precioMaximo: number | null = null;
  ordenarPor: 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre-asc' = 'relevancia';
  ocultarSinStock = false;

  // Paginación
  paginaActual = 1;
  tamanioPagina = 20;
  totalItems = 0;
  totalPaginas = 0;

  constructor(
    private shopService: ShopService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private metaService: MetaService
  ) {}

  ngOnInit() {
    this.metaService.actualizarMetaEtiquetas({
      titulo: 'Catálogo de Productos',
      descripcion: 'Explora nuestra amplia colección de calzado. Encuentra el par perfecto para cada ocasión.',
      tipo: 'website'
    });
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.shopService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
        this.notificationService.error('Error al cargar las categorías');
      }
    });
  }

  cargarProductos() {
    this.cargando = true;
    this.shopService.obtenerProductos(
      this.categoriaSeleccionadaId || undefined,
      this.terminoBusqueda || undefined,
      this.precioMinimo || undefined,
      this.precioMaximo || undefined,
      this.paginaActual,
      this.tamanioPagina
    ).subscribe({
      next: (response: PaginatedResponse<Producto>) => {
        this.productos = response.items || [];
        this.totalItems = response.totalItems;
        this.totalPaginas = response.totalPages;
        this.aplicarFiltrosCliente();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.notificationService.error('Error al cargar los productos');
        this.cargando = false;
      }
    });
  }

  onCambioCategoria(categoriaId: number | null) {
    this.categoriaSeleccionadaId = categoriaId;
    this.paginaActual = 1;
    this.cargarProductos();
  }

  onBuscar() {
    this.paginaActual = 1;
    this.cargarProductos();
  }

  onFiltroPrecio() {
    this.paginaActual = 1;
    this.cargarProductos();
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarProductos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  alternarFiltroStock() {
    this.ocultarSinStock = !this.ocultarSinStock;
    this.aplicarFiltrosCliente();
  }

  limpiarFiltros() {
    this.categoriaSeleccionadaId = null;
    this.terminoBusqueda = '';
    this.precioMinimo = null;
    this.precioMaximo = null;
    this.ordenarPor = 'relevancia';
    this.ocultarSinStock = false;
    this.paginaActual = 1;
    this.cargarProductos();
    this.cerrarFiltros();
  }

  alternarFiltros() {
    this.filtrosAbiertos = !this.filtrosAbiertos;
  }

  cerrarFiltros() {
    this.filtrosAbiertos = false;
  }

  aplicarFiltros() {
    this.cargarProductos();
    this.cerrarFiltros();
  }

  aplicarFiltrosCliente() {
    let filtrados = [...this.productos];

    if (this.ocultarSinStock) {
      filtrados = filtrados.filter(producto => producto.stock > 0);
    }

    switch (this.ordenarPor) {
      case 'precio-asc':
        filtrados.sort((a, b) => a.precioVenta - b.precioVenta);
        break;
      case 'precio-desc':
        filtrados.sort((a, b) => b.precioVenta - a.precioVenta);
        break;
      case 'nombre-asc':
        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
    }

    this.productosFiltrados = filtrados;
  }

  onVistaRapida(producto: Producto) {
    this.productoSeleccionado = producto;
    this.mostrarVistaRapida = true;
  }

  cerrarVistaRapida() {
    this.mostrarVistaRapida = false;
    this.productoSeleccionado = null;
  }

  agregarDesdeVistaRapida() {
    if (this.productoSeleccionado) {
      this.agregarAlCarrito(this.productoSeleccionado);
      this.cerrarVistaRapida();
    }
  }

  tieneFiltrosActivos(): boolean {
    return !!(this.categoriaSeleccionadaId || this.terminoBusqueda || this.precioMinimo || this.precioMaximo);
  }

  obtenerCantidadFiltrosActivos(): number {
    let cantidad = 0;
    if (this.categoriaSeleccionadaId) cantidad++;
    if (this.terminoBusqueda) cantidad++;
    if (this.precioMinimo || this.precioMaximo) cantidad++;
    return cantidad;
  }

  agregarAlCarrito(producto: Producto) {
    const resultado = this.cartService.agregarAlCarrito(producto);
    if (resultado.success) {
      this.notificationService.success(`✓ ${producto.nombre} agregado al carrito`);
    } else {
      this.notificationService.error(resultado.message);
    }
  }

  onCambioOrden() {
    this.aplicarFiltrosCliente();
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  obtenerImagenProducto(producto: Producto): string {
    if (producto.urlImagen && producto.urlImagen.startsWith('http')) {
      return producto.urlImagen;
    }

    const nombre = (producto.nombre || '').toLowerCase();
    const cat = (producto.nombreCategoria || '').toLowerCase();

    if (nombre.includes('sneaker') || nombre.includes('zapatilla') || nombre.includes('running'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop';
    if (nombre.includes('formal') || nombre.includes('oxford') || nombre.includes('clásic'))
      return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80&fit=crop';
    if (nombre.includes('bota') || nombre.includes('boot'))
      return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80&fit=crop';
    if (nombre.includes('sandalia') || nombre.includes('sandal'))
      return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80&fit=crop';
    if (nombre.includes('casual') || nombre.includes('loafer'))
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80&fit=crop';
    if (nombre.includes('sport') || nombre.includes('gym') || nombre.includes('training'))
      return 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80&fit=crop';
    if (nombre.includes('mocasín') || nombre.includes('moccasin') || nombre.includes('slip'))
      return 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80&fit=crop';
    if (nombre.includes('dama') || nombre.includes('mujer') || nombre.includes('tac') || nombre.includes('heel'))
      return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80&fit=crop';
    if (nombre.includes('niño') || nombre.includes('kid') || nombre.includes('infant'))
      return 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80&fit=crop';

    if (cat.includes('sneaker') || cat.includes('sport'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop';
    if (cat.includes('formal'))
      return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80&fit=crop';
    if (cat.includes('casual'))
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80&fit=crop';
    if (cat.includes('bota') || cat.includes('boot'))
      return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80&fit=crop';

    const fallbacks = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80&fit=crop',
    ];
    return fallbacks[producto.id % fallbacks.length];
  }
}
