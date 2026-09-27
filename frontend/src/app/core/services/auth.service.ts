import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthRequest, AuthResponse, UtilisateurInfo } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UtilisateurInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated = signal(false);
  public currentUserRole = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/v1/auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUserSubject.next(response.utilisateur);
        this.isAuthenticated.set(true);
        this.currentUserRole.set(response.utilisateur.role);
        localStorage.setItem('currentUser', JSON.stringify(response.utilisateur));
      })
    );
  }

  registerProducteur(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/v1/auth/register/producteur`, data);
  }

  registerEleveur(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/v1/auth/register/eleveur`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.currentUserRole.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
      this.isAuthenticated.set(true);
      this.currentUserRole.set(JSON.parse(user).role);
    }
  }

  getCurrentUser(): UtilisateurInfo | null {
    return this.currentUserSubject.value;
  }
}
