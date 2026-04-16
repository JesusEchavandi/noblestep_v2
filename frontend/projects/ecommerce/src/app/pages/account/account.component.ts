import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EcommerceAuthService, ClienteEcommerce } from '../../services/ecommerce-auth.service';
import { OrderService, Pedido } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  cliente: ClienteEcommerce | null = null;
  pedidos: Pedido[] = [];
  pestanaActiva: 'pedidos' | 'perfil' | 'configuracion' = 'pedidos';
  cargando = false;
  editandoPerfil = false;

  // Boleta de pedidos
  mostrarModalBoleta = false;
  cargandoBoleta = false;
  boletaError = '';
  contenidoBoleta = '';
  boletaBlob: Blob | null = null;
  pedidoBoleta: Pedido | null = null;

  formularioPerfil = {
    nombreCompleto: '',
    telefono: '',
    numeroDocumento: '',
    direccion: '',
    ciudad: '',
    distrito: ''
  };

  constructor(
    private authService: EcommerceAuthService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.clienteActual$.subscribe(cliente => {
      this.cliente = cliente;
      if (cliente) {
        this.formularioPerfil = {
          nombreCompleto: cliente.nombreCompleto,
          telefono: cliente.telefono || '',
          numeroDocumento: cliente.numeroDocumento || '',
          direccion: cliente.direccion || '',
          ciudad: cliente.ciudad || '',
          distrito: cliente.distrito || ''
        };
      }
    });

    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.orderService.obtenerMisPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.notificationService.error('Error al cargar pedidos');
      }
    });
  }

  establecerPestanaActiva(pestana: 'pedidos' | 'perfil' | 'configuracion') {
    this.pestanaActiva = pestana;
    this.editandoPerfil = false;
  }

  alternarEditarPerfil() {
    this.editandoPerfil = !this.editandoPerfil;
  }

  guardarPerfil() {
    if (!this.formularioPerfil.nombreCompleto) {
      this.notificationService.warning('El nombre es requerido');
      return;
    }

    this.cargando = true;
    this.authService.actualizarPerfil(this.formularioPerfil).subscribe({
      next: (cliente) => {
        this.cargando = false;
        this.editandoPerfil = false;
        this.notificationService.success('Perfil actualizado exitosamente');
      },
      error: (error) => {
        this.cargando = false;
        this.notificationService.error('Error al actualizar el perfil');
      }
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.notificationService.success('Sesión cerrada');
    this.router.navigate(['/']);
  }

  obtenerColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'Pendiente': '#f59e0b',
      'EnProceso': '#3b82f6',
      'Enviado': '#8b5cf6',
      'Entregado': '#10b981',
      'Cancelado': '#ef4444',
      'Reembolsado': '#6b7280'
    };
    return colores[estado] || '#6b7280';
  }

  obtenerTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      'Pendiente': 'Pendiente',
      'EnProceso': 'En Proceso',
      'Enviado': 'Enviado',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado',
      'Reembolsado': 'Reembolsado'
    };
    return textos[estado] || estado;
  }

  obtenerTextoEstadoPago(estado: string): string {
    const textos: { [key: string]: string } = {
      'Pendiente': 'Pendiente',
      'Pagado': 'Pagado',
      'Fallido': 'Fallido',
      'Reembolsado': 'Reembolsado'
    };
    return textos[estado] || estado;
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  formatearFecha(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  obtenerIconoEstadoPedido(estado: string): string {
    const iconos: { [key: string]: string } = {
      'Pendiente': '⏳',
      'EnProceso': '📦',
      'Enviado': '🚚',
      'Entregado': '✅',
      'Cancelado': '❌',
      'Reembolsado': '🔄'
    };
    return iconos[estado] || '📋';
  }

  obtenerNombreMetodoPago(metodo: string): string {
    const metodos: { [key: string]: string } = {
      'yape': 'Yape',
      'card': 'Tarjeta',
      'transfer': 'Transferencia'
    };
    return metodos[metodo] || metodo;
  }

  verDetallesPedido(pedido: Pedido) {
    console.log('Ver detalles:', pedido);
  }

  verBoletaPedido(pedido: Pedido) {
    this.pedidoBoleta = pedido;
    this.mostrarModalBoleta = true;
    this.cargandoBoleta = true;
    this.boletaError = '';
    this.contenidoBoleta = '';
    this.boletaBlob = null;

    this.orderService.obtenerBoletaPedido(pedido.id).subscribe({
      next: (blob) => {
        this.boletaBlob = blob;
        blob.text().then((txt) => {
          this.contenidoBoleta = txt;
          this.cargandoBoleta = false;
        });
      },
      error: () => {
        this.boletaError = 'No se pudo cargar la boleta del pedido.';
        this.cargandoBoleta = false;
      }
    });
  }

  descargarBoletaPedido(pedido: Pedido) {
    this.orderService.descargarBoletaPedido(pedido.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `boleta-pedido-${pedido.numeroPedido || pedido.id}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => {
        this.notificationService.error('No se pudo descargar la boleta del pedido');
      }
    });
  }

  descargarBoletaActual() {
    if (!this.boletaBlob || !this.pedidoBoleta) return;

    const url = URL.createObjectURL(this.boletaBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `boleta-pedido-${this.pedidoBoleta.numeroPedido || this.pedidoBoleta.id}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  cerrarModalBoleta() {
    this.mostrarModalBoleta = false;
    this.cargandoBoleta = false;
    this.boletaError = '';
    this.contenidoBoleta = '';
    this.boletaBlob = null;
    this.pedidoBoleta = null;
  }

  rastrearPedido(numeroPedido: string) {
    this.notificationService.info(`Rastreando pedido #${numeroPedido}`);
  }
}
