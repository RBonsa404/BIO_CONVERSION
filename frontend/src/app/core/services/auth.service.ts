import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import {
  ApiResponse,
  AuthRequest,
  AuthResponse,
  BackendAuthResponse,
  BackendUtilisateurInfo,
  ProfilUpdateRequest,
  UtilisateurInfo
} from '../models/auth.model';
import { EleveurRegisterRequest } from '../models/eleveur-register-request.model';
import { ProducteurRegisterRequest } from '../models/producteur-register-request.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  /** Utilisateur connecté, ou null. Source unique de vérité pour toute l'application. */
  readonly currentUser = signal<UtilisateurInfo | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly currentUserRole = computed(() => this.currentUser()?.role ?? null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<BackendAuthResponse>>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map(response => ({
        token: response.data.token,
        utilisateur: this.mapUser(response.data.user)
      })),
      tap(response => {
        this.write(TOKEN_KEY, response.token);
        this.storeUser(response.utilisateur);
      })
    );
  }

  /**
   * Inscription producteur : les informations (partie « donnees », en JSON) et la photo ou le
   * scan de la CNIB (partie « cnib ») partent ensemble, dans une seule requête multipart.
   */
  registerProducteur(data: ProducteurRegisterRequest, cnib: File): Observable<ApiResponse<BackendUtilisateurInfo>> {
    const formulaire = new FormData();
    formulaire.append('donnees', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formulaire.append('cnib', cnib);
    return this.http.post<ApiResponse<BackendUtilisateurInfo>>(`${this.apiUrl}/auth/register/producteur`, formulaire);
  }

  registerEleveur(data: EleveurRegisterRequest): Observable<ApiResponse<BackendUtilisateurInfo>> {
    return this.http.post<ApiResponse<BackendUtilisateurInfo>>(`${this.apiUrl}/auth/register/eleveur`, data);
  }

  /** Recharge le profil depuis le serveur (les données locales peuvent dater). */
  chargerProfil(): Observable<UtilisateurInfo> {
    return this.http.get<ApiResponse<BackendUtilisateurInfo>>(`${this.apiUrl}/auth/me`).pipe(
      map(response => this.mapUser(response.data)),
      tap(user => this.storeUser(user))
    );
  }

  modifierProfil(data: ProfilUpdateRequest): Observable<UtilisateurInfo> {
    return this.http.put<ApiResponse<BackendUtilisateurInfo>>(`${this.apiUrl}/auth/me`, data).pipe(
      map(response => this.mapUser(response.data)),
      tap(user => this.storeUser(user))
    );
  }

  changerMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/auth/me/mot-de-passe`, {
      ancienMotDePasse,
      nouveauMotDePasse
    });
  }

  logout(): void {
    this.remove(TOKEN_KEY);
    this.remove(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  getCurrentUser(): UtilisateurInfo | null {
    return this.currentUser();
  }

  /** Page d'arrivée de l'espace connecté selon le rôle. */
  homeRoute(role: string | null = this.currentUserRole()): string {
    switch (role) {
      case 'PRODUCTEUR': return '/dashboard/producteur';
      case 'ELEVEUR': return '/marketplace';
      case 'ADMINISTRATEUR':
      case 'SUPER_ADMINISTRATEUR': return '/admin';
      default: return '/connexion';
    }
  }

  private mapUser(user: BackendUtilisateurInfo): UtilisateurInfo {
    const { id, ...rest } = user;
    return { idUtilisateur: id, ...rest };
  }

  private storeUser(user: UtilisateurInfo): void {
    this.currentUser.set(user);
    this.write(USER_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      if (token && user && !this.isExpired(token)) {
        this.currentUser.set(JSON.parse(user));
        return;
      }
    } catch { /* stockage indisponible ou contenu illisible : session ignorée */ }
    this.remove(TOKEN_KEY);
    this.remove(USER_KEY);
  }

  /** Un jeton expiré est écarté dès le chargement, sans attendre un 401 du serveur. */
  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch { /* stockage indisponible : la session ne survivra pas au rechargement */ }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch { /* stockage indisponible */ }
  }
}
