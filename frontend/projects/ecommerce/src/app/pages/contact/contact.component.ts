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
  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  
  submitting = false;
  submitted = false;
  error = false;

  constructor(
    private shopService: ShopService,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    if (this.isFormValid()) {
      this.submitting = true;
      
      this.shopService.submitContact(this.contactForm).subscribe({
        next: () => {
          this.submitting = false;
          this.submitted = true;
          this.notificationService.success('✓ Mensaje enviado correctamente. Nos contactaremos pronto.');
          this.resetForm();
          
          // Ocultar mensaje de éxito después de 5 segundos
          setTimeout(() => this.submitted = false, 5000);
        },
        error: (err) => {
          console.error('Error submitting contact form:', err);
          this.submitting = false;
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

  isFormValid(): boolean {
    return !!(this.contactForm.name && 
              this.contactForm.email && 
              this.contactForm.phone && 
              this.contactForm.message);
  }

  resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }
}
