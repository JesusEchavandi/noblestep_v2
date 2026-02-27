import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface EcommerceCustomer {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpires: Date;
  customer: EcommerceCustomer;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  fullName: string;
  phone?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  district?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EcommerceAuthService {
  private apiUrl = `${environment.apiUrl}/ecommerce/auth`;
  private currentCustomerSubject = new BehaviorSubject<EcommerceCustomer | null>(null);
  public currentCustomer$ = this.currentCustomerSubject.asObservable();

  private tokenKey = 'ecommerce_token';
  private customerKey = 'ecommerce_customer';
  private refreshTokenKey = 'ecommerce_refresh_token';

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem(this.tokenKey);
    const customerData = localStorage.getItem(this.customerKey);

    if (token && customerData) {
      try {
        // Si el token ya expiró, limpiar sesión automáticamente
        if (this.isTokenExpired(token)) {
          this.logout();
          return;
        }
        const customer = JSON.parse(customerData);
        this.currentCustomerSubject.next(customer);
      } catch (e) {
        this.logout();
      }
    }
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.customerKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentCustomerSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken: token }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  getProfile(): Observable<EcommerceCustomer> {
    return this.http.get<EcommerceCustomer>(`${this.apiUrl}/profile`).pipe(
      tap(customer => {
        this.currentCustomerSubject.next(customer);
        localStorage.setItem(this.customerKey, JSON.stringify(customer));
      })
    );
  }

  updateProfile(data: UpdateProfileData): Observable<EcommerceCustomer> {
    return this.http.put<EcommerceCustomer>(`${this.apiUrl}/profile`, data).pipe(
      tap(customer => {
        this.currentCustomerSubject.next(customer);
        localStorage.setItem(this.customerKey, JSON.stringify(customer));
      })
    );
  }

  private handleAuthResponse(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.customerKey, JSON.stringify(response.customer));
    if (response.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    }
    this.currentCustomerSubject.next(response.customer);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /** Decodifica el payload JWT y verifica si ya expiró */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      // exp está en segundos, Date.now() en milisegundos
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true; // token malformado → considerar expirado
    }
  }

  getCurrentCustomer(): EcommerceCustomer | null {
    return this.currentCustomerSubject.value;
  }
}
