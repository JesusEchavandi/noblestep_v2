import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface ClienteEcommerce {
  id: number;
  correo: string;
  nombreCompleto: string;
  telefono?: string;
  numeroDocumento?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
  correoVerificado: boolean;
  creadoEn: Date;
}

export interface RespuestaAutenticacion {
  token: string;
  tokenRefresco: string;
  expiracionTokenRefresco: Date;
  cliente: ClienteEcommerce;
}

export interface DatosRegistro {
  correo: string;
  contrasena: string;
  nombreCompleto: string;
  telefono?: string;
}

export interface DatosInicioSesion {
  correo: string;
  contrasena: string;
}

export interface DatosActualizarPerfil {
  nombreCompleto: string;
  telefono?: string;
  numeroDocumento?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
}

export interface RespuestaTokenRecuperacion {
  message: string;
  expiraEnMinutos: number;
}

@Injectable({
  providedIn: 'root'
})
export class EcommerceAuthService {
  private apiUrl = `${environment.apiUrl}/ecommerce/auth`;
  private sujetoClienteActual = new BehaviorSubject<ClienteEcommerce | null>(null);
  public clienteActual$ = this.sujetoClienteActual.asObservable();

  private tokenKey = 'ecommerce_token';
  private customerKey = 'ecommerce_customer';
  private refreshTokenKey = 'ecommerce_refresh_token';

  constructor(private http: HttpClient, private router: Router) {
    this.cargarDeStorage();
  }

  private cargarDeStorage() {
    const token = localStorage.getItem(this.tokenKey);
    const customerData = localStorage.getItem(this.customerKey);

    if (token && customerData) {
      try {
        if (this.tokenExpirado(token)) {
          this.cerrarSesion();
          return;
        }
        const cliente = JSON.parse(customerData);
        this.sujetoClienteActual.next(cliente);
      } catch (e) {
        this.cerrarSesion();
      }
    }
  }

  registrar(datos: DatosRegistro): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/register`, datos).pipe(
      tap(respuesta => this.manejarRespuestaAuth(respuesta))
    );
  }

  iniciarSesion(datos: DatosInicioSesion): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/login`, datos).pipe(
      tap(respuesta => this.manejarRespuestaAuth(respuesta))
    );
  }

  cerrarSesion() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.customerKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.sujetoClienteActual.next(null);
    this.router.navigate(['/login']);
  }

  refrescarToken(): Observable<RespuestaAutenticacion> {
    const token = this.obtenerRefreshToken();
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/refresh-token`, { tokenRefresco: token }).pipe(
      tap(respuesta => this.manejarRespuestaAuth(respuesta))
    );
  }

  obtenerRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  generarTokenRecuperacion(correo: string): Observable<RespuestaTokenRecuperacion> {
    return this.http.post<RespuestaTokenRecuperacion>(`${this.apiUrl}/forgot-password`, { correo });
  }

  restablecerContrasena(token: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, nuevaContrasena });
  }

  obtenerPerfil(): Observable<ClienteEcommerce> {
    return this.http.get<ClienteEcommerce>(`${this.apiUrl}/profile`).pipe(
      tap(cliente => {
        this.sujetoClienteActual.next(cliente);
        localStorage.setItem(this.customerKey, JSON.stringify(cliente));
      })
    );
  }

  actualizarPerfil(datos: DatosActualizarPerfil): Observable<ClienteEcommerce> {
    return this.http.put<ClienteEcommerce>(`${this.apiUrl}/profile`, datos).pipe(
      tap(cliente => {
        this.sujetoClienteActual.next(cliente);
        localStorage.setItem(this.customerKey, JSON.stringify(cliente));
      })
    );
  }

  private manejarRespuestaAuth(respuesta: RespuestaAutenticacion) {
    localStorage.setItem(this.tokenKey, respuesta.token);
    localStorage.setItem(this.customerKey, JSON.stringify(respuesta.cliente));
    if (respuesta.tokenRefresco) {
      localStorage.setItem(this.refreshTokenKey, respuesta.tokenRefresco);
    }
    this.sujetoClienteActual.next(respuesta.cliente);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;
    return !this.tokenExpirado(token);
  }

  /** Decodifica el payload JWT y verifica si ya expiró */
  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  obtenerClienteActual(): ClienteEcommerce | null {
    return this.sujetoClienteActual.value;
  }
}
