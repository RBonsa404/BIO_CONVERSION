import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

export interface ProducteurLocalise {
  producteurId: number;
  nomExploitation: string;
  ville: string;
  province: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

export interface Produit {
  idProduit: number;
  producteurId: number;
  nomExploitation: string;
  nomProduit: string;
  quantiteStock: number;
  prix: number;
  typeProduit: string;
  disponibilite: boolean;
}

export interface ProducteurProfile {
  id: number;
  nom: string;
  prenom: string;
  nomExploitation: string;
  capaciteProduction: number;
  statut: string;
  ville: string | null;
  province: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LigneCommande {
  idLigne: number;
  produitId: number;
  nomProduit: string;
  quantite: number;
  prixUnitaireFige: number;
  sousTotal: number;
}

export interface Commande {
  idCommande: number;
  numeroCommande: string;
  eleveurId: number;
  nomEleveur: string;
  producteurId: number;
  nomExploitation: string;
  dateCommande: string;
  statut: string;
  montantTotal: number;
  lignes: LigneCommande[];
}

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  rechercherProducteursParRayon(
    latitude: number,
    longitude: number,
    rayonKm = 50
  ): Observable<ApiResponse<ProducteurLocalise[]>> {
    return this.http.get<ApiResponse<ProducteurLocalise[]>>(
      `${this.apiUrl}/api/v1/marketplace/producteurs/recherche-geolocalisee`,
      { params: { latitude, longitude, rayonKm } }
    );
  }

  listerProduits(page = 0, size = 20): Observable<ApiResponse<PageResponse<Produit>>> {
    return this.http.get<ApiResponse<PageResponse<Produit>>>(
      `${this.apiUrl}/api/v1/marketplace/produits`,
      { params: { page, size } }
    );
  }

  obtenirProduit(produitId: number): Observable<ApiResponse<Produit>> {
    return this.http.get<ApiResponse<Produit>>(
      `${this.apiUrl}/api/v1/marketplace/produits/${produitId}`
    );
  }

  consulterCatalogueProducteur(producteurId: number): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(
      `${this.apiUrl}/api/v1/marketplace/produits/producteur/${producteurId}`
    );
  }

  obtenirProducteur(producteurId: number): Observable<ApiResponse<ProducteurProfile>> {
    return this.http.get<ApiResponse<ProducteurProfile>>(
      `${this.apiUrl}/api/v1/producteurs/${producteurId}`
    );
  }

  passerCommande(
    eleveurId: number,
    produitId: number,
    quantite: number,
    idempotencyKey = `cmd-${crypto.randomUUID()}`
  ): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/api/v1/marketplace/commandes`,
      { eleveurId, produitId, quantite, idempotencyKey }
    );
  }

  listerCommandesEleveur(
    eleveurId: number,
    page = 0,
    size = 20
  ): Observable<ApiResponse<PageResponse<Commande>>> {
    return this.http.get<ApiResponse<PageResponse<Commande>>>(
      `${this.apiUrl}/api/v1/marketplace/commandes/eleveur/${eleveurId}`,
      { params: { page, size } }
    );
  }

  listerCommandesProducteur(
    producteurId: number,
    page = 0,
    size = 20
  ): Observable<ApiResponse<PageResponse<Commande>>> {
    return this.http.get<ApiResponse<PageResponse<Commande>>>(
      `${this.apiUrl}/api/v1/marketplace/commandes/producteur/${producteurId}`,
      { params: { page, size } }
    );
  }

  obtenirCommande(commandeId: number): Observable<ApiResponse<Commande>> {
    return this.http.get<ApiResponse<Commande>>(
      `${this.apiUrl}/api/v1/marketplace/commandes/${commandeId}`
    );
  }

  confirmerCommande(commandeId: number): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/api/v1/marketplace/commandes/${commandeId}/confirmer`,
      {}
    );
  }

  refuserCommande(commandeId: number): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/api/v1/marketplace/commandes/${commandeId}/refuser`,
      {}
    );
  }

  annulerCommande(commandeId: number, motif?: string): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/api/v1/marketplace/commandes/${commandeId}/annuler`,
      {},
      { params: motif ? { motif } : {} }
    );
  }
}
