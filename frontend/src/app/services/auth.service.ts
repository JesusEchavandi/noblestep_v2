import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SolicitudInicioSesion, RespuestaInicioSesion } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private sujetoUsuarioActual = new BehaviorSubject<RespuestaInicioSesion | null>(this.obtenerUsuarioDeStorage());
  public usuarioActual$ = this.sujetoUsuarioActual.asObservable();

  iniciarSesion(credenciales: SolicitudInicioSesion): Observable<RespuestaInicioSesion> {
    return this.http.post<RespuestaInicioSesion>(`${this.API_URL}/auth/login`, credenciales).pipe(
      tap(respuesta => {
        localStorage.setItem('currentUser', JSON.stringify(respuesta));
        this.sujetoUsuarioActual.next(respuesta);
      })
    );
  }

  cerrarSesion(): void {
    localStorage.removeItem('currentUser');
    this.sujetoUsuarioActual.next(null);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    const usuario = this.obtenerUsuarioDeStorage();
    return usuario?.token || null;
  }

  estaAutenticado(): boolean {
    const usuario = this.obtenerUsuarioDeStorage();
    if (!usuario) return false;
    
    // Verificar si el token ha expirado
    const expiraEn = new Date(usuario.expiraEn);
    return expiraEn > new Date();
  }

  obtenerUsuarioActual(): RespuestaInicioSesion | null {
    return this.obtenerUsuarioDeStorage();
  }

  tieneRol(rol: string): boolean {
    const usuario = this.obtenerUsuarioDeStorage();
    return usuario?.rol === rol;
  }

  private obtenerUsuarioDeStorage(): RespuestaInicioSesion | null {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      // JSON corrupto o manipulado — limpiar y forzar re-login
      localStorage.removeItem('currentUser');
      return null;
    }
  }
}
