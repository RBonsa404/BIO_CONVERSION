import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

export interface Paiement {
  idPaiement: number;
  idCommande: number;
  montant: number;
  operateur: string;
  referenceTransaction: string;
  datePaiement: string;
  statutPaiement: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  initierPaiement(idCommande: number, operateur: string): Observable<ApiResponse<Paiement>> {
    return this.http.post<ApiResponse<Paiement>>(
      `${this.apiUrl}/api/v1/paiements`,
      { idCommande, operateur }
    );
  }

  consulterParCommande(idCommande: number): Observable<ApiResponse<Paiement>> {
    return this.http.get<ApiResponse<Paiement>>(
      `${this.apiUrl}/api/v1/paiements/commande/${idCommande}`
    );
  }

  totalPaiementsConfirmes(producteurId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/api/v1/paiements/producteur/${producteurId}/solde`
    );
  }
}
