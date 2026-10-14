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

/** Soldes des registres (somme de leurs lignes) et commissions espèces en attente. */
export interface ResumeFonds {
  soldeFonds: number;
  soldeSequestre: number;
  totalACollecter: number;
  nombreACollecter: number;
}

export interface CommissionACollecter {
  id: number;
  commandeId: number;
  numeroCommande: string;
  producteurId: number;
  nomExploitation: string;
  telephoneProducteur: string | null;
  montant: number;
  dateVente: string;
}

export interface EncaissementRequest {
  collecteur: string;
  montant: number;
  /** Format AAAA-MM-JJ ; aujourd'hui si absent. */
  dateEncaissement?: string;
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

  resumeCommissions(): Observable<ApiResponse<ResumeFonds>> {
    return this.http.get<ApiResponse<ResumeFonds>>(`${this.apiUrl}/commissions/resume`);
  }

  commissionsACollecter(): Observable<ApiResponse<CommissionACollecter[]>> {
    return this.http.get<ApiResponse<CommissionACollecter[]>>(`${this.apiUrl}/commissions/a-collecter`);
  }

  /** Le collecteur a récupéré la commission : elle entre dans le fonds de la plateforme. */
  encaisserCommission(id: number, requete: EncaissementRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/commissions/${id}/encaisser`, requete);
  }
}
