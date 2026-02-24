import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer, CreateCustomer } from '../models/customer.model';
import { environment } from '../../environments/environment';
import { PagedResult } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL = `${environment.apiUrl}/customers`;
  private http = inject(HttpClient);

  /** Devuelve todos los clientes (pageSize=200 para compatibilidad con componentes existentes) */
  getCustomers(): Observable<Customer[]> {
    return this.http.get<PagedResult<Customer>>(`${this.API_URL}?page=1&pageSize=200`)
      .pipe(map(res => res.data));
  }

  /** Versión paginada */
  getCustomersPaged(page = 1, pageSize = 50): Observable<PagedResult<Customer>> {
    return this.http.get<PagedResult<Customer>>(`${this.API_URL}?page=${page}&pageSize=${pageSize}`);
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.API_URL}/${id}`);
  }

  createCustomer(customer: CreateCustomer): Observable<Customer> {
    return this.http.post<Customer>(this.API_URL, customer);
  }

  updateCustomer(id: number, customer: CreateCustomer): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
