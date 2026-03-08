import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cliente, CrearCliente } from '../models/customer.model';
import { environment } from '../../environments/environment';
import { ResultadoPaginado } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL = `${environment.apiUrl}/customers`;
  private http = inject(HttpClient);

  /** Devuelve todos los clientes (pageSize=200 para compatibilidad con componentes existentes) */
  obtenerClientes(): Observable<Cliente[]> {
    return this.http.get<ResultadoPaginado<Cliente>>(`${this.API_URL}?page=1&pageSize=200`)
      .pipe(map(res => res.datos));
  }

  /** Versión paginada */
  obtenerClientesPaginados(pagina = 1, tamanoPagina = 50): Observable<ResultadoPaginado<Cliente>> {
    return this.http.get<ResultadoPaginado<Cliente>>(`${this.API_URL}?page=${pagina}&pageSize=${tamanoPagina}`);
  }

  obtenerCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.API_URL}/${id}`);
  }

  crearCliente(cliente: CrearCliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.API_URL, cliente);
  }

  actualizarCliente(id: number, cliente: CrearCliente): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, cliente);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
