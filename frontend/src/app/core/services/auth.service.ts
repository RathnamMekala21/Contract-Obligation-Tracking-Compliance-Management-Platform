import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, TokenResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Reactive Signals for active user state
  public currentUser = signal<User | null>(this.getStoredUser());
  public isAuthenticated = signal<boolean>(this.checkAuthStatus());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.access_token) {
          this.setToken(res.access_token);
          
          // Construct or extract user metadata from payload
          const decodedUser: User = res.user || this.decodeUserFromToken(res.access_token, credentials.email);
          this.setStoredUser(decodedUser);
          
          this.currentUser.set(decodedUser);
          this.isAuthenticated.set(true);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  loginAsDemoUser(role: string = 'Contract Manager', email: string = 'contract.manager@contractiq.com'): Observable<TokenResponse> {
    const demoToken = 'demo_access_token_' + Date.now();
    const demoUser: User = {
      user_id: 99,
      name: 'Demo ' + role,
      email: email,
      role: role,
      department: 'Legal & Compliance'
    };

    this.setToken(demoToken);
    this.setStoredUser(demoUser);
    this.currentUser.set(demoUser);
    this.isAuthenticated.set(true);

    return of({
      access_token: demoToken,
      token_type: 'bearer',
      user: demoUser
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      return null;
    }
    return token;
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    if (token.startsWith('demo_access_token_')) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false; // Non-standard or simple token, assume valid if not expired
      const payloadBase64 = parts[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      if (payload.exp) {
        const expiryDateMs = payload.exp * 1000;
        return Date.now() >= expiryDateMs;
      }
      return false;
    } catch {
      return false;
    }
  }

  checkAuthStatus(): boolean {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      return false;
    }
    return true;
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private getStoredUser(): User | null {
    const data = localStorage.getItem('current_user');
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setStoredUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private decodeUserFromToken(token: string, fallbackEmail: string): User {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return {
        user_id: payload.user_id || payload.sub || 1,
        name: payload.name || payload.full_name || fallbackEmail.split('@')[0] || 'User',
        email: payload.email || fallbackEmail,
        role: payload.role || 'Contract Manager',
        department: payload.department || 'Legal'
      };
    } catch {
      return {
        user_id: 1,
        name: 'User',
        email: fallbackEmail,
        role: 'Contract Manager',
        department: 'Legal'
      };
    }
  }

  getUserRole(): string {
    const user = this.currentUser();
    return user ? user.role : '';
  }

  hasRole(allowedRoles: string[]): boolean {
    const role = this.getUserRole();
    if (!role) return false;
    return allowedRoles.some(r => r.toLowerCase() === role.toLowerCase());
  }
}
