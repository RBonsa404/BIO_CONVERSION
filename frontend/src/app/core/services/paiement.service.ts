import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { StatutPaiement } from './marketplace.service';

export interface Paiement {
  idPaiement: number;
  idCommande: number;
  montant: number;
  operateur: string;
  referenceTransaction: string;
  datePaiement: string;
  statutPaiement: StatutPaiement;
  referenceFacture: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  initierPaiement(idCommande: number, operateur: string): Observable<ApiResponse<Paiement>> {
    return this.http.post<ApiResponse<Paiement>>(
      `${this.apiUrl}/paiements`,
      { idCommande, operateur }
    );
  }

  consulterParCommande(idCommande: number): Observable<ApiResponse<Paiement>> {
    return this.http.get<ApiResponse<Paiement>>(
      `${this.apiUrl}/paiements/commande/${idCommande}`
    );
  }

  /** Vrai tant que la confirmation de l'opérateur est simulée côté serveur. */
  simulationActive(): Observable<boolean> {
    return this.http.get<ApiResponse<{ simulation: boolean }>>(`${this.apiUrl}/paiements/mode`).pipe(
      map(response => response.data.simulation)
    );
  }

  /** Réponse opérateur simulée pour le paiement en attente de la commande. */
  simulerReponseOperateur(idCommande: number, succes: boolean): Observable<ApiResponse<Paiement>> {
    return this.http.post<ApiResponse<Paiement>>(
      `${this.apiUrl}/paiements/commande/${idCommande}/simulation`,
      {},
      { params: { succes } }
    );
  }

  /** Paiement en espèces : le producteur confirme avoir reçu l'argent de l'éleveur. */
  confirmerEncaissementEspeces(idCommande: number): Observable<ApiResponse<Paiement>> {
    return this.http.post<ApiResponse<Paiement>>(
      `${this.apiUrl}/paiements/commande/${idCommande}/especes/confirmer`,
      {}
    );
  }

  totalPaiementsConfirmes(producteurId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/paiements/producteur/${producteurId}/solde`
    );
  }

  /**
   * Télécharge la facture PDF d'une commande payée. Le fichier passe par HttpClient
   * (et non par un simple lien) pour que la requête porte le jeton d'authentification.
   */
  telechargerFacture(idCommande: number, numeroCommande: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/factures/commande/${idCommande}/telecharger`, {
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${numeroCommande}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      })
    );
  }
}
