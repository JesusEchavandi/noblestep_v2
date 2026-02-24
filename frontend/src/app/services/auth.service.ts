import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const user = this.getUserFromStorage();
    return user?.token || null;
  }

  isAuthenticated(): boolean {
    const user = this.getUserFromStorage();
    if (!user) return false;
    
    // Check if token is expired
    const expiresAt = new Date(user.expiresAt);
    return expiresAt > new Date();
  }

  getCurrentUser(): LoginResponse | null {
    return this.getUserFromStorage();
  }

  hasRole(role: string): boolean {
    const user = this.getUserFromStorage();
    return user?.role === role;
  }

  private getUserFromStorage(): LoginResponse | null {
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
