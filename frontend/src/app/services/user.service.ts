import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
}

export interface CrearUsuario {
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  rol: string;
}

export interface ActualizarUsuario {
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  contrasena?: string;
  rol: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: CrearUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: ActualizarUsuario): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  activarUsuario(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  desactivarUsuario(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
