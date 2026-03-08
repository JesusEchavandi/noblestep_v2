import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MetaService } from '../../services/meta.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-claims-book',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './claims-book.component.html',
  styleUrls: ['./claims-book.component.css']
})
export class ClaimsBookComponent implements OnInit {
  reclamacion = {
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    menorEdad: false,
    apoderadoNombres: '',
    apoderadoCorreo: '',
    tipoReclamacion: 'reclamo',
    montoReclamado: null as number | null,
    descripcionProducto: '',
    detalleReclamacion: '',
    pedidoAccion: '',
    aceptaTerminos: false
  };

  enviado = false;
  enviando = false;
  numeroReclamo = '';

  constructor(
    private metaService: MetaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.metaService.actualizarMetaEtiquetas({
      titulo: 'Libro de Reclamaciones - NobleStep',
      descripcion: 'Libro de Reclamaciones virtual conforme a la Ley N° 29571 y D.S. 011-2011-PCM.',
      tipo: 'website'
    });
  }

  enviarReclamacion() {
    if (!this.validarFormulario()) return;

    this.enviando = true;
    
    // Generar número de reclamo
    const fecha = new Date();
    this.numeroReclamo = `NS-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Simular envío (en producción: enviar al backend + email)
    setTimeout(() => {
      this.enviado = true;
      this.enviando = false;
      this.notificationService.success('Reclamación registrada correctamente.');
    }, 1500);
  }

  validarFormulario(): boolean {
    if (!this.reclamacion.numeroDocumento || !this.reclamacion.nombres || !this.reclamacion.apellidos) {
      this.notificationService.error('Complete sus datos personales.');
      return false;
    }
    if (!this.reclamacion.correo || !this.reclamacion.correo.includes('@')) {
      this.notificationService.error('Ingrese un correo electrónico válido.');
      return false;
    }
    if (!this.reclamacion.descripcionProducto) {
      this.notificationService.error('Describa el producto o servicio objeto del reclamo.');
      return false;
    }
    if (!this.reclamacion.detalleReclamacion) {
      this.notificationService.error('Detalle su reclamación o queja.');
      return false;
    }
    if (!this.reclamacion.aceptaTerminos) {
      this.notificationService.error('Debe aceptar los términos para enviar la reclamación.');
      return false;
    }
    return true;
  }

  nuevaReclamacion() {
    this.enviado = false;
    this.reclamacion = {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      direccion: '',
      menorEdad: false,
      apoderadoNombres: '',
      apoderadoCorreo: '',
      tipoReclamacion: 'reclamo',
      montoReclamado: null,
      descripcionProducto: '',
      detalleReclamacion: '',
      pedidoAccion: '',
      aceptaTerminos: false
    };
  }
}
