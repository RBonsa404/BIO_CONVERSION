import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, BackendUtilisateurInfo, StatutUtilisateur } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { PageResponse, StatutCommande } from './marketplace.service';

export interface StatistiquesPlateforme {
  producteurs: number;
  eleveurs: number;
  comptesEnAttente: number;
  produitsDisponibles: number;
  commandes: number;
  commandesParStatut: Record<StatutCommande, number>;
  volumePaiementsConfirmes: number;
  tauxCommission: number;
  commissionPlateforme: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  listerUtilisateurs(
    statut?: StatutUtilisateur,
    page = 0,
    size = 100
  ): Observable<ApiResponse<PageResponse<BackendUtilisateurInfo>>> {
    return this.http.get<ApiResponse<PageResponse<BackendUtilisateurInfo>>>(
      `${this.apiUrl}/utilisateurs`,
      { params: statut ? { statut, page, size } : { page, size } }
    );
  }

  validerInscription(utilisateurId: number, approuve: boolean): Observable<ApiResponse<BackendUtilisateurInfo>> {
    return this.http.put<ApiResponse<BackendUtilisateurInfo>>(
      `${this.apiUrl}/utilisateurs/${utilisateurId}/valider`,
      null,
      { params: { approuve } }
    );
  }

  suspendre(utilisateurId: number): Observable<ApiResponse<BackendUtilisateurInfo>> {
    return this.http.put<ApiResponse<BackendUtilisateurInfo>>(
      `${this.apiUrl}/utilisateurs/${utilisateurId}/suspendre`,
      null
    );
  }

  reactiver(utilisateurId: number): Observable<ApiResponse<BackendUtilisateurInfo>> {
    return this.http.put<ApiResponse<BackendUtilisateurInfo>>(
      `${this.apiUrl}/utilisateurs/${utilisateurId}/reactiver`,
      null
    );
  }

  /** Mot de passe oublié : génère un mot de passe temporaire à transmettre à l'utilisateur. */
  reinitialiserMotDePasse(utilisateurId: number): Observable<ApiResponse<{ motDePasseTemporaire: string }>> {
    return this.http.put<ApiResponse<{ motDePasseTemporaire: string }>>(
      `${this.apiUrl}/utilisateurs/${utilisateurId}/reinitialiser-mot-de-passe`,
      null
    );
  }

  /** Pièce d'identité (CNIB) déposée à l'inscription : image ou PDF, réservée aux administrateurs. */
  pieceIdentite(utilisateurId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/utilisateurs/${utilisateurId}/piece-identite`, { responseType: 'blob' });
  }

  statistiques(): Observable<ApiResponse<StatistiquesPlateforme>> {
    return this.http.get<ApiResponse<StatistiquesPlateforme>>(`${this.apiUrl}/statistiques`);
  }
}