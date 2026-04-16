import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, ItemCarrito } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { OrderService, DatosCrearPedido } from '../../services/order.service';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { Producto } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  itemsCarrito: ItemCarrito[] = [];
  
  // Datos del cliente
  datosCliente = {
    nombreCompleto: '',
    correo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    distrito: '',
    referencia: ''
  };
  
  // Método de pago seleccionado
  metodoPago: 'yape' | 'card' | 'transfer' = 'yape';
  
  // Datos de pago
  datosPago = {
    // Para Yape
    telefonoYape: '',
    
    // Para tarjeta
    numeroTarjeta: '',
    nombreTarjeta: '',
    vencimientoTarjeta: '',
    cvvTarjeta: '',
    
    // Para transferencia
    bancoTransferencia: '',
    cuentaTransferencia: ''
  };
  
  // Comprobante de pago
  archivoComprobante: File | null = null;
  vistaComprobante: string | null = null;
  
  procesando = false;
  terminosAceptados = false;
  tipoComprobante: 'Boleta' | 'Factura' = 'Boleta';
  
  // Datos de factura
  datosFactura = {
    razonSocial: '',
    ruc: '',
    direccionEmpresa: ''
  };

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    private orderService: OrderService,
    private authService: EcommerceAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.carrito$.subscribe(items => {
      this.itemsCarrito = items;
      
      // Si el carrito está vacío, redirigir
      if (this.itemsCarrito.length === 0) {
        this.notificationService.warning('Tu carrito está vacío');
        this.router.navigate(['/catalog']);
      }
    });

    // Pre-rellenar datos si el usuario está autenticado
    const cliente = this.authService.obtenerClienteActual();
    if (cliente) {
      this.datosCliente.nombreCompleto = cliente.nombreCompleto;
      this.datosCliente.correo = cliente.correo;
      this.datosCliente.telefono = cliente.telefono || '';
      this.datosCliente.direccion = cliente.direccion || '';
      this.datosCliente.ciudad = cliente.ciudad || '';
      this.datosCliente.distrito = cliente.distrito || '';
    }
  }

  obtenerSubtotal(): number {
    return this.itemsCarrito.reduce((total, item) => 
      total + (item.producto.precioVenta * item.cantidad), 0
    );
  }

  obtenerEnvio(): number {
    return this.obtenerSubtotal() >= 100 ? 0 : 10;
  }

  obtenerTotal(): number {
    return this.obtenerSubtotal() + this.obtenerEnvio();
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  seleccionarMetodoPago(metodo: 'yape' | 'card' | 'transfer') {
    this.metodoPago = metodo;
  }

  alSeleccionarComprobante(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.notificationService.warning('Solo se permiten imágenes');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.warning('La imagen no debe superar 5MB');
        return;
      }

      this.archivoComprobante = file;

      // Generar preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vistaComprobante = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  quitarComprobante() {
    this.archivoComprobante = null;
    this.vistaComprobante = null;
  }

  /** Regex RFC 5322 simplificada para validar correo electrónico */
  private esCorreoValido(correo: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(correo);
  }

  /** Algoritmo de Luhn para validación de número de tarjeta */
  private verificarLuhn(numeroTarjeta: string): boolean {
    const digitos = numeroTarjeta.replace(/\D/g, '');
    if (digitos.length < 13 || digitos.length > 19) return false;
    let suma = 0;
    let debeDoble = false;
    for (let i = digitos.length - 1; i >= 0; i--) {
      let digito = parseInt(digitos[i], 10);
      if (debeDoble) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
      debeDoble = !debeDoble;
    }
    return suma % 10 === 0;
  }

  /** Valida RUC peruano: 11 dígitos, empieza con 10 o 20 */
  private esRucValido(ruc: string): boolean {
    return /^(10|20)\d{9}$/.test(ruc);
  }

  esFormularioValido(): boolean {
    // Validar datos del cliente
    const clienteValido = !!(
      this.datosCliente.nombreCompleto.trim() &&
      this.datosCliente.correo.trim() &&
      this.datosCliente.telefono.trim() &&
      this.datosCliente.direccion.trim() &&
      this.datosCliente.ciudad.trim() &&
      this.datosCliente.distrito.trim()
    );
    if (!clienteValido) return false;

    // Validar correo con regex
    if (!this.esCorreoValido(this.datosCliente.correo)) return false;

    // Validar datos de factura si aplica
    if (this.tipoComprobante === 'Factura') {
      if (!this.datosFactura.razonSocial.trim()) return false;
      if (!this.esRucValido(this.datosFactura.ruc)) return false;
    }

    // Validar según método de pago
    if (this.metodoPago === 'yape') {
      return !!this.datosPago.telefonoYape && this.datosPago.telefonoYape.length === 9;
    } else if (this.metodoPago === 'card') {
      const tarjetaOk = !!(
        this.datosPago.numeroTarjeta &&
        this.datosPago.nombreTarjeta &&
        this.datosPago.vencimientoTarjeta &&
        this.datosPago.cvvTarjeta
      );
      if (!tarjetaOk) return false;
      // Validar número de tarjeta con algoritmo Luhn
      if (!this.verificarLuhn(this.datosPago.numeroTarjeta)) return false;
      return true;
    } else if (this.metodoPago === 'transfer') {
      return !!(
        this.datosPago.bancoTransferencia &&
        this.datosPago.cuentaTransferencia
      );
    }

    return false;
  }

  async procesarPago() {
    if (!this.terminosAceptados) {
      this.notificationService.warning('Debes aceptar los términos y condiciones');
      return;
    }

    if (!this.esFormularioValido()) {
      if (this.datosCliente.correo && !this.esCorreoValido(this.datosCliente.correo)) {
        this.notificationService.warning('Por favor ingresa un email válido');
      } else if (this.tipoComprobante === 'Factura' && this.datosFactura.ruc && !this.esRucValido(this.datosFactura.ruc)) {
        this.notificationService.warning('El RUC debe tener 11 dígitos y empezar con 10 o 20');
      } else if (this.metodoPago === 'card' && this.datosPago.numeroTarjeta && !this.verificarLuhn(this.datosPago.numeroTarjeta)) {
        this.notificationService.warning('El número de tarjeta no es válido');
      } else {
        this.notificationService.warning('Por favor, completa todos los campos requeridos');
      }
      return;
    }

    // Validar comprobante para métodos que lo requieren
    if (this.metodoPago === 'yape' && !this.archivoComprobante) {
      this.notificationService.warning('Por favor, adjunta el comprobante de pago de Yape');
      return;
    }

    this.procesando = true;

    // Convertir comprobante a Base64 si existe
    let comprobanteBase64: string | undefined = undefined;
    if (this.archivoComprobante) {
      try {
        comprobanteBase64 = await this.archivoABase64Optimizado(this.archivoComprobante);
      } catch (error) {
        this.procesando = false;
        this.notificationService.error('Error al procesar el comprobante de pago');
        return;
      }
    }

    // Preparar datos del pedido
    const datosPedido: DatosCrearPedido = {
      nombreCompletoCliente: this.datosCliente.nombreCompleto,
      correoCliente: this.datosCliente.correo,
      telefonoCliente: this.datosCliente.telefono,
      direccionCliente: this.datosCliente.direccion,
      ciudadCliente: this.datosCliente.ciudad,
      distritoCliente: this.datosCliente.distrito,
      referenciaCliente: this.datosCliente.referencia,
      metodoPago: this.metodoPago,
      comprobanteBase64: comprobanteBase64,
      tipoComprobante: this.tipoComprobante,
      nombreEmpresa: this.tipoComprobante === 'Factura' ? this.datosFactura.razonSocial : undefined,
      rucEmpresa: this.tipoComprobante === 'Factura' ? this.datosFactura.ruc : undefined,
      direccionEmpresa: this.tipoComprobante === 'Factura' ? this.datosFactura.direccionEmpresa : undefined,
      items: this.itemsCarrito.map(item => ({
        productoId: item.producto.id,
        varianteId: item.varianteId,       // talla seleccionada — backend descuenta stock correcto
        cantidad: item.cantidad,
      }))
    };

    // Enviar pedido al backend
    this.orderService.crearPedido(datosPedido).subscribe({
      next: (pedido) => {
        this.procesando = false;
        this.notificationService.success(
          `¡Pedido #${pedido.numeroPedido} realizado con éxito! Recibirás un email de confirmación.`
        );
        
        // Limpiar carrito
        this.cartService.vaciarCarrito();
        
        // Redirigir según si está autenticado
        if (this.authService.estaAutenticado()) {
          this.router.navigate(['/account'], { queryParams: { tab: 'orders' } });
        } else {
          this.router.navigate(['/'], { queryParams: { order: 'success' } });
        }
      },
      error: (error) => {
        this.procesando = false;
        this.notificationService.error(
          error.error?.message || 'Error al procesar el pedido. Por favor intenta nuevamente.'
        );
      }
    });
  }

  private archivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async archivoABase64Optimizado(file: File): Promise<string> {
    const dataUrl = await this.archivoABase64(file);

    // Si no es imagen, enviar tal cual.
    if (!file.type.startsWith('image/')) {
      return dataUrl;
    }

    const img = await this.cargarImagen(dataUrl);
    const maxSide = 1400;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(img.width * scale));
    canvas.height = Math.max(1, Math.floor(img.height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return dataUrl;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.82;
    let optimized = canvas.toDataURL('image/jpeg', quality);

    // Reducir más si sigue muy grande (~1.6 MB en base64).
    while (optimized.length > 1_600_000 && quality > 0.5) {
      quality -= 0.08;
      optimized = canvas.toDataURL('image/jpeg', quality);
    }

    return optimized;
  }

  private cargarImagen(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  obtenerImagenProducto(producto: Producto): string {
    if (producto.urlImagen) return producto.urlImagen;
    const nombre = producto.nombre?.toLowerCase() || '';
    if (nombre.includes('sneaker') || nombre.includes('zapatill') || nombre.includes('running')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
    if (nombre.includes('formal') || nombre.includes('oxford') || nombre.includes('cuero')) return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80';
    if (nombre.includes('bota') || nombre.includes('boot')) return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80';
    if (nombre.includes('sandal') || nombre.includes('verano')) return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80';
    if (nombre.includes('sport') || nombre.includes('gym')) return 'https://images.unsplash.com/photo-1579338908476-3a3a1d71a706?w=400&q=80';
    if (nombre.includes('casual') || nombre.includes('loafer')) return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80';
    const imgs = ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80','https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80','https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80'];
    return imgs[producto.id % imgs.length];
  }

  cotizarEnvioWsp(): void {
    const telefono = '51999999999';
    const distrito = this.datosCliente.distrito || 'mi distrito';
    const msg = `¡Hola! Quisiera cotizar el costo de envío a *${distrito}* para mi pedido de NobleStep. 📦`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  cotizarPedidoCompleto(): void {
    const telefono = '51999999999';
    let msg = '¡Hola! Quiero realizar el siguiente pedido en NobleStep:\n\n';
    this.itemsCarrito.forEach((item, i) => {
      const talla = item.tallaSeleccionada ? ` (Talla ${item.tallaSeleccionada})` : '';
      msg += `${i + 1}. *${item.producto.nombre}*${talla} x${item.cantidad} — S/ ${(item.producto.precioVenta * item.cantidad).toFixed(2)}\n`;
    });
    msg += `\n💰 *Subtotal: S/ ${this.obtenerSubtotal().toFixed(2)}*`;
    if (this.datosCliente.distrito) msg += `\n📍 Distrito: ${this.datosCliente.distrito}`;
    if (this.datosCliente.nombreCompleto) msg += `\n👤 Nombre: ${this.datosCliente.nombreCompleto}`;
    if (this.datosCliente.telefono) msg += `\n📱 Celular: ${this.datosCliente.telefono}`;
    msg += '\n\n¿Me pueden ayudar a coordinar el envío y confirmar el pedido?';
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  consultarStock() {
    this.cotizarPedidoCompleto();
  }

  generarMensajeConsultaStock(): string {
    return '';
  }
}
