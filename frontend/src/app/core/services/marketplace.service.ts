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

export type TypeProduit = 'LARVE' | 'RESIDU_PRODUCTION';

export interface Produit {
  idProduit: number;
  producteurId: number;
  nomExploitation: string;
  nomProduit: string;
  quantiteStock: number;
  prix: number;
  typeProduit: TypeProduit;
  disponibilite: boolean;
}

export interface ProduitRequest {
  nomProduit: string;
  typeProduit: TypeProduit;
  prix: number;
  quantiteStock: number;
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
  capaciteDerniereMaj: string | null;
  nombreConsultations: number;
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

export type StatutCommande =
  | 'EN_ATTENTE' | 'CONFIRME' | 'PAYE' | 'REFUSE'
  | 'EXPEDIE' | 'LIVRE' | 'NON_CONFIRMEE' | 'ANNULE';

export type StatutPaiement = 'EN_ATTENTE' | 'CONFIRME' | 'ECHOUE' | 'REMBOURSE';

export type OperateurPaiement = 'ORANGE_MONEY' | 'ESPECES';

export interface Commande {
  idCommande: number;
  numeroCommande: string;
  eleveurId: number;
  nomEleveur: string;
  producteurId: number;
  nomExploitation: string;
  dateCommande: string;
  statut: StatutCommande;
  montantTotal: number;
  lignes: LigneCommande[];
  telephoneEleveur: string | null;
  telephoneProducteur: string | null;
  statutPaiement: StatutPaiement | null;
  operateurPaiement: OperateurPaiement | null;
  referenceFacture: string | null;
}

/**
 * crypto.randomUUID n'existe qu'en contexte sécurisé (HTTPS ou localhost) : sur une
 * adresse du réseau local en HTTP, on se rabat sur un identifiant horodaté.
 */
function nouvelleCleIdempotence(): string {
  const aleatoire = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `cmd-${aleatoire}`;
}

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Recherche et catalogue public ───────────────────────────────────────

  rechercherProducteursParRayon(
    latitude: number,
    longitude: number,
    rayonKm = 50
  ): Observable<ApiResponse<ProducteurLocalise[]>> {
    return this.http.get<ApiResponse<ProducteurLocalise[]>>(
      `${this.apiUrl}/marketplace/producteurs/recherche-geolocalisee`,
      { params: { latitude, longitude, rayonKm } }
    );
  }

  listerProduits(page = 0, size = 100): Observable<ApiResponse<PageResponse<Produit>>> {
    return this.http.get<ApiResponse<PageResponse<Produit>>>(
      `${this.apiUrl}/marketplace/produits`,
      { params: { page, size } }
    );
  }

  obtenirProduit(produitId: number): Observable<ApiResponse<Produit>> {
    return this.http.get<ApiResponse<Produit>>(
      `${this.apiUrl}/marketplace/produits/${produitId}`
    );
  }

  consulterCatalogueProducteur(producteurId: number): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(
      `${this.apiUrl}/marketplace/produits/producteur/${producteurId}`
    );
  }

  obtenirProducteur(producteurId: number): Observable<ApiResponse<ProducteurProfile>> {
    return this.http.get<ApiResponse<ProducteurProfile>>(
      `${this.apiUrl}/producteurs/${producteurId}`
    );
  }

  // ── Catalogue du producteur connecté ────────────────────────────────────

  listerMesProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/marketplace/produits/mes-produits`);
  }

  publierProduit(produit: ProduitRequest): Observable<ApiResponse<Produit>> {
    return this.http.post<ApiResponse<Produit>>(`${this.apiUrl}/marketplace/produits`, produit);
  }

  modifierProduit(produitId: number, produit: ProduitRequest): Observable<ApiResponse<Produit>> {
    return this.http.put<ApiResponse<Produit>>(`${this.apiUrl}/marketplace/produits/${produitId}`, produit);
  }

  retirerProduit(produitId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/marketplace/produits/${produitId}`);
  }

  republierProduit(produitId: number): Observable<ApiResponse<Produit>> {
    return this.http.post<ApiResponse<Produit>>(
      `${this.apiUrl}/marketplace/produits/${produitId}/republier`,
      {}
    );
  }

  // ── Cycle de commande ───────────────────────────────────────────────────

  passerCommande(
    produitId: number,
    quantite: number,
    idempotencyKey = nouvelleCleIdempotence()
  ): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/marketplace/commandes`,
      { produitId, quantite, idempotencyKey }
    );
  }

  listerCommandesEleveur(
    eleveurId: number,
    page = 0,
    size = 100
  ): Observable<ApiResponse<PageResponse<Commande>>> {
    return this.http.get<ApiResponse<PageResponse<Commande>>>(
      `${this.apiUrl}/marketplace/commandes/eleveur/${eleveurId}`,
      { params: { page, size } }
    );
  }

  listerCommandesProducteur(
    producteurId: number,
    page = 0,
    size = 100
  ): Observable<ApiResponse<PageResponse<Commande>>> {
    return this.http.get<ApiResponse<PageResponse<Commande>>>(
      `${this.apiUrl}/marketplace/commandes/producteur/${producteurId}`,
      { params: { page, size } }
    );
  }

  obtenirCommande(commandeId: number): Observable<ApiResponse<Commande>> {
    return this.http.get<ApiResponse<Commande>>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}`
    );
  }

  confirmerCommande(commandeId: number): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}/confirmer`,
      {}
    );
  }

  refuserCommande(commandeId: number): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}/refuser`,
      {}
    );
  }

  annulerCommande(commandeId: number, motif?: string): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}/annuler`,
      {},
      { params: motif ? { motif } : {} }
    );
  }

  /** Suivi de livraison : EXPEDIE (producteur) puis LIVRE (producteur ou éleveur). */
  changerStatutCommande(commandeId: number, nouveauStatut: 'EXPEDIE' | 'LIVRE'): Observable<ApiResponse<Commande>> {
    return this.http.patch<ApiResponse<Commande>>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}/statut`,
      { nouveauStatut }
    );
  }
}