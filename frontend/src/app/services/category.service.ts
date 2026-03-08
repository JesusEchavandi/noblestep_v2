import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CrearCategoria } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = `${environment.apiUrl}/categories`;
  private http = inject(HttpClient);

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.API_URL);
  }

  obtenerCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.API_URL}/${id}`);
  }

  crearCategoria(categoria: CrearCategoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.API_URL, categoria);
  }

  actualizarCategoria(id: number, categoria: CrearCategoria): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, categoria);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
