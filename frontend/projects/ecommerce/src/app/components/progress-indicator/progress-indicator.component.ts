import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-bar-container">
      <div 
        class="progress-bar" 
        [style.width.%]="progress">
        {{ progress }}%
      </div>
    </div>
    
    <!-- Versión con mensaje personalizado -->
    <div *ngIf="showMessage" style="text-align: center; margin-top: 0.5rem; color: var(--color-text-secondary); font-size: 0.875rem;">
      {{ message }}
    </div>
  `,
  styles: []
})
export class ProgressIndicatorComponent {
  @Input() progress: number = 0;
  @Input() showMessage: boolean = false;
  @Input() message: string = '';
}
