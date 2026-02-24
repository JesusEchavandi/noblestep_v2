import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { OrderService, CreateOrderData } from '../../services/order.service';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  
  // Datos del cliente
  customerData = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    reference: ''
  };
  
  // Método de pago seleccionado
  paymentMethod: 'yape' | 'card' | 'transfer' = 'yape';
  
  // Datos de pago
  paymentData = {
    // Para Yape
    yapePhone: '',
    
    // Para tarjeta
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    
    // Para transferencia
    transferBank: '',
    transferAccount: ''
  };
  
  // Comprobante de pago
  paymentProofFile: File | null = null;
  paymentProofPreview: string | null = null;
  
  processing = false;
  termsAccepted = false;
  invoiceType: 'Boleta' | 'Factura' = 'Boleta';
  
  // Datos de factura
  invoiceData = {
    companyName: '',
    companyRUC: '',
    companyAddress: ''
  };

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    private orderService: OrderService,
    private authService: EcommerceAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      
      // Si el carrito está vacío, redirigir
      if (this.cartItems.length === 0) {
        this.notificationService.warning('Tu carrito está vacío');
        this.router.navigate(['/catalog']);
      }
    });

    // Pre-rellenar datos si el usuario está autenticado
    const customer = this.authService.getCurrentCustomer();
    if (customer) {
      this.customerData.fullName = customer.fullName;
      this.customerData.email = customer.email;
      this.customerData.phone = customer.phone || '';
      this.customerData.address = customer.address || '';
      this.customerData.city = customer.city || '';
      this.customerData.district = customer.district || '';
    }
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.product.salePrice * item.quantity), 0
    );
  }

  getShipping(): number {
    return this.getSubtotal() >= 100 ? 0 : 10;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping();
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  selectPaymentMethod(method: 'yape' | 'card' | 'transfer') {
    this.paymentMethod = method;
  }

  onPaymentProofSelected(event: any) {
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

      this.paymentProofFile = file;

      // Generar preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.paymentProofPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePaymentProof() {
    this.paymentProofFile = null;
    this.paymentProofPreview = null;
  }

  /** Regex RFC 5322 simplificada para validar email */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /** Algoritmo de Luhn para validación de número de tarjeta */
  private luhnCheck(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  /** Valida RUC peruano: 11 dígitos, empieza con 10 o 20 */
  private isValidRUC(ruc: string): boolean {
    return /^(10|20)\d{9}$/.test(ruc);
  }

  isFormValid(): boolean {
    // Validar datos del cliente
    const customerValid = !!(
      this.customerData.fullName.trim() &&
      this.customerData.email.trim() &&
      this.customerData.phone.trim() &&
      this.customerData.address.trim() &&
      this.customerData.city.trim() &&
      this.customerData.district.trim()
    );
    if (!customerValid) return false;

    // Validar email con regex
    if (!this.isValidEmail(this.customerData.email)) return false;

    // Validar datos de factura si aplica
    if (this.invoiceType === 'Factura') {
      if (!this.invoiceData.companyName.trim()) return false;
      if (!this.isValidRUC(this.invoiceData.companyRUC)) return false;
    }

    // Validar según método de pago
    if (this.paymentMethod === 'yape') {
      return !!this.paymentData.yapePhone && this.paymentData.yapePhone.length === 9;
    } else if (this.paymentMethod === 'card') {
      const cardOk = !!(
        this.paymentData.cardNumber &&
        this.paymentData.cardName &&
        this.paymentData.cardExpiry &&
        this.paymentData.cardCvv
      );
      if (!cardOk) return false;
      // Validar número de tarjeta con algoritmo Luhn
      if (!this.luhnCheck(this.paymentData.cardNumber)) return false;
      return true;
    } else if (this.paymentMethod === 'transfer') {
      return !!(
        this.paymentData.transferBank &&
        this.paymentData.transferAccount
      );
    }

    return false;
  }

  async processPayment() {
    if (!this.termsAccepted) {
      this.notificationService.warning('Debes aceptar los términos y condiciones');
      return;
    }

    if (!this.isFormValid()) {
      if (this.customerData.email && !this.isValidEmail(this.customerData.email)) {
        this.notificationService.warning('Por favor ingresa un email válido');
      } else if (this.invoiceType === 'Factura' && this.invoiceData.companyRUC && !this.isValidRUC(this.invoiceData.companyRUC)) {
        this.notificationService.warning('El RUC debe tener 11 dígitos y empezar con 10 o 20');
      } else if (this.paymentMethod === 'card' && this.paymentData.cardNumber && !this.luhnCheck(this.paymentData.cardNumber)) {
        this.notificationService.warning('El número de tarjeta no es válido');
      } else {
        this.notificationService.warning('Por favor, completa todos los campos requeridos');
      }
      return;
    }

    // Validar comprobante para métodos que lo requieren
    if (this.paymentMethod === 'yape' && !this.paymentProofFile) {
      this.notificationService.warning('Por favor, adjunta el comprobante de pago de Yape');
      return;
    }

    this.processing = true;

    // Convertir comprobante a Base64 si existe
    let paymentProofBase64: string | undefined = undefined;
    if (this.paymentProofFile) {
      try {
        paymentProofBase64 = await this.fileToBase64(this.paymentProofFile);
      } catch (error) {
        this.processing = false;
        this.notificationService.error('Error al procesar el comprobante de pago');
        return;
      }
    }

    // Preparar datos del pedido
    const orderData: CreateOrderData = {
      customerFullName: this.customerData.fullName,
      customerEmail: this.customerData.email,
      customerPhone: this.customerData.phone,
      customerAddress: this.customerData.address,
      customerCity: this.customerData.city,
      customerDistrict: this.customerData.district,
      customerReference: this.customerData.reference,
      paymentMethod: this.paymentMethod,
      paymentProofBase64: paymentProofBase64,
      invoiceType: this.invoiceType,
      companyName: this.invoiceType === 'Factura' ? this.invoiceData.companyName : undefined,
      companyRUC: this.invoiceType === 'Factura' ? this.invoiceData.companyRUC : undefined,
      companyAddress: this.invoiceType === 'Factura' ? this.invoiceData.companyAddress : undefined,
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        variantId: item.variantId,       // talla seleccionada — backend descuenta stock correcto
        quantity: item.quantity,
        
      }))
    };

    // Enviar pedido al backend
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.processing = false;
        this.notificationService.success(
          `¡Pedido #${order.orderNumber} realizado con éxito! Recibirás un email de confirmación.`
        );
        
        // Limpiar carrito
        this.cartService.clearCart();
        
        // Redirigir según si está autenticado
        if (this.authService.isAuthenticated()) {
          this.router.navigate(['/account'], { queryParams: { tab: 'orders' } });
        } else {
          this.router.navigate(['/'], { queryParams: { order: 'success' } });
        }
      },
      error: (error) => {
        this.processing = false;
        this.notificationService.error(
          error.error?.message || 'Error al procesar el pedido. Por favor intenta nuevamente.'
        );
      }
    });
  }

  private fileToBase64(file: File): Promise<string> {
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

  getProductImage(product: Product): string {
    if (product.imageUrl) return product.imageUrl;
    const name = product.name?.toLowerCase() || '';
    if (name.includes('sneaker') || name.includes('zapatill') || name.includes('running')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
    if (name.includes('formal') || name.includes('oxford') || name.includes('cuero')) return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80';
    if (name.includes('bota') || name.includes('boot')) return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80';
    if (name.includes('sandal') || name.includes('verano')) return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80';
    if (name.includes('sport') || name.includes('gym')) return 'https://images.unsplash.com/photo-1579338908476-3a3a1d71a706?w=400&q=80';
    if (name.includes('casual') || name.includes('loafer')) return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80';
    const imgs = ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80','https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80','https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80'];
    return imgs[product.id % imgs.length];
  }

  cotizarEnvioWsp(): void {
    const phone = '51999999999';
    const district = this.customerData.district || 'mi distrito';
    const msg = `¡Hola! Quisiera cotizar el costo de envío a *${district}* para mi pedido de NobleStep. 📦`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  cotizarPedidoCompleto(): void {
    const phone = '51999999999';
    let msg = '¡Hola! Quiero realizar el siguiente pedido en NobleStep:\n\n';
    this.cartItems.forEach((item, i) => {
      const size = item.selectedSize ? ` (Talla ${item.selectedSize})` : '';
      msg += `${i + 1}. *${item.product.name}*${size} x${item.quantity} — S/ ${(item.product.salePrice * item.quantity).toFixed(2)}\n`;
    });
    msg += `\n💰 *Subtotal: S/ ${this.getSubtotal().toFixed(2)}*`;
    if (this.customerData.district) msg += `\n📍 Distrito: ${this.customerData.district}`;
    if (this.customerData.fullName) msg += `\n👤 Nombre: ${this.customerData.fullName}`;
    if (this.customerData.phone) msg += `\n📱 Celular: ${this.customerData.phone}`;
    msg += '\n\n¿Me pueden ayudar a coordinar el envío y confirmar el pedido?';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  consultStock() {
    this.cotizarPedidoCompleto();
  }

  generateStockConsultMessage(): string {
    return '';
  }
}
