import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-bar-container">
      <div class="search-bar">
        <div class="search-icon">🔍</div>
        <input 
          type="text" 
          [(ngModel)]="searchTerm"
          (input)="onSearchChange()"
          (keyup.enter)="onSearch()"
          placeholder="Busca productos, categorías..."
          class="search-input">
        <button 
          *ngIf="searchTerm" 
          (click)="clearSearch()" 
          class="clear-btn">
          ✕
        </button>
        <button 
          (click)="onSearch()" 
          class="search-btn">
          Buscar
        </button>
      </div>
      
      <!-- Resultados de autocompletado -->
      <div *ngIf="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <div 
          *ngFor="let suggestion of suggestions" 
          (click)="selectSuggestion(suggestion)"
          class="suggestion-item">
          <span class="suggestion-icon">📦</span>
          <span class="suggestion-text">{{ suggestion }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-bar-container {
      position: relative;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: var(--color-white);
      border-radius: var(--radius-full);
      padding: 0.5rem 0.75rem;
      box-shadow: 0 4px 20px rgba(42, 54, 59, 0.1);
      transition: all var(--transition-base);
      border: 2px solid transparent;
    }

    .search-bar:focus-within {
      box-shadow: 0 8px 30px rgba(232, 74, 95, 0.2);
      border-color: var(--color-primary);
      transform: translateY(-2px);
    }

    .search-icon {
      font-size: 1.2rem;
      margin-right: 0.75rem;
      color: var(--color-text-muted);
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: var(--font-size-base);
      background: transparent;
      color: var(--color-dark);
    }

    .search-input::placeholder {
      color: var(--color-text-muted);
    }

    .clear-btn {
      background: var(--color-gray-100);
      color: var(--color-text-secondary);
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: 0.5rem;
      transition: all var(--transition-fast);
      font-size: 0.875rem;
    }

    .clear-btn:hover {
      background: var(--color-gray-200);
      transform: scale(1.1);
    }

    .search-btn {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: var(--color-white);
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: var(--radius-full);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 2px 10px rgba(232, 74, 95, 0.3);
    }

    .search-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(232, 74, 95, 0.4);
    }

    .search-btn:active {
      transform: scale(0.98);
    }

    .suggestions-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: var(--color-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      max-height: 300px;
      overflow-y: auto;
      z-index: 100;
      animation: fadeInUp 0.3s ease-out;
    }

    .suggestion-item {
      padding: 0.875rem 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all var(--transition-fast);
      border-bottom: 1px solid var(--color-gray-50);
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item:hover {
      background: linear-gradient(90deg, rgba(254, 206, 168, 0.2), rgba(153, 184, 152, 0.2));
      padding-left: 1.5rem;
    }

    .suggestion-icon {
      font-size: 1.2rem;
    }

    .suggestion-text {
      color: var(--color-dark);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .search-btn {
        padding: 0.5rem 1rem;
        font-size: var(--font-size-sm);
      }
    }
  `]
})
export class SearchBarComponent {
  searchTerm = '';
  showSuggestions = false;
  suggestions: string[] = [];

  @Output() search = new EventEmitter<string>();

  onSearchChange() {
    // Simulación de autocompletado - puedes conectarlo a un servicio real
    if (this.searchTerm.length >= 2) {
      this.showSuggestions = true;
      // Aquí conectarías con tu servicio de productos
      this.suggestions = [
        'Productos relacionados con: ' + this.searchTerm,
        // Agregar sugerencias reales desde el backend
      ];
    } else {
      this.showSuggestions = false;
      this.suggestions = [];
    }
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm);
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string) {
    this.searchTerm = suggestion;
    this.showSuggestions = false;
    this.onSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.showSuggestions = false;
    this.suggestions = [];
    this.search.emit('');
  }
}
