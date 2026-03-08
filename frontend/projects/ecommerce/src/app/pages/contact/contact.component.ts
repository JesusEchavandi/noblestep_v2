import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../services/shop.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formularioContacto = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  
  enviando = false;
  enviado = false;
  error = false;

  constructor(
    private shopService: ShopService,
    private notificationService: NotificationService
  ) {}

  alEnviar() {
    if (this.esFormularioValido()) {
      this.enviando = true;
      
      this.shopService.enviarContacto(this.formularioContacto).subscribe({
        next: () => {
          this.enviando = false;
          this.enviado = true;
          this.notificationService.success('✓ Mensaje enviado correctamente. Nos contactaremos pronto.');
          this.reiniciarFormulario();
          
          // Ocultar mensaje de éxito después de 5 segundos
          setTimeout(() => this.enviado = false, 5000);
        },
        error: (err) => {
          console.error('Error al enviar formulario de contacto:', err);
          this.enviando = false;
          this.error = true;
          this.notificationService.error('Error al enviar el mensaje. Por favor, intenta nuevamente.');
          
          // Ocultar mensaje de error después de 5 segundos
          setTimeout(() => this.error = false, 5000);
        }
      });
    } else {
      this.notificationService.warning('Por favor, completa todos los campos del formulario');
    }
  }

  esFormularioValido(): boolean {
    return !!(this.formularioContacto.name && 
              this.formularioContacto.email && 
              this.formularioContacto.phone && 
              this.formularioContacto.message);
  }

  reiniciarFormulario() {
    this.formularioContacto = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }
}
