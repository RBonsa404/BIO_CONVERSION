import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { PageResponse } from './marketplace.service';

/** Compte en attente de validation (producteur ou éleveur), tel que renvoyé par le backend. */
export interface CompteEnAttente {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;               // 'PRODUCTEUR' ou 'ELEVEUR'
  statut: string;
  nomExploitation?: string;   // producteurs uniquement
  capaciteProduction?: number;
  ville?: string;
  province?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listerComptesEnAttente(page = 0, size = 20): Observable<ApiResponse<PageResponse<CompteEnAttente>>> {
    return this.http.get<ApiResponse<PageResponse<CompteEnAttente>>>(
      `${this.apiUrl}/admin/utilisateurs/en-attente`,
      { params: { page, size } }
    );
  }

  validerCompte(utilisateurId: number, approuve: boolean): Observable<ApiResponse<CompteEnAttente>> {
    return this.http.put<ApiResponse<CompteEnAttente>>(
      `${this.apiUrl}/admin/utilisateurs/${utilisateurId}/valider`,
      null,
      { params: { approuve } }
    );
  }
}