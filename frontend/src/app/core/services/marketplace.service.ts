import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProducteurLocalise {
  id: number;
  nom: string;
  prenom: string;
  nomFerme: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  noteMoyenne?: number;
  nombreAvis?: number;
  stockTotal: number;
}

export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  quantiteDisponible: number;
  unite: string;
  producteurId: number;
  nomProducteur: string;
}

export interface Commande {
  id: number;
  reference: string;
  quantite: number;
  montantTotal: number;
  statut: string;
  dateCreation: string;
  produitId: number;
  produitNom: string;
  producteurId: number;
  producteurNom: string;
  eleveurId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Rechercher des producteurs par rayon géographique
  rechercherProducteursParRayon(latitude: number, longitude: number, rayonKm: number = 50): Observable<{ data: ProducteurLocalise[] }> {
    return this.http.get<{ data: ProducteurLocalise[] }>(
      `${this.apiUrl}/marketplace/producteurs/recherche-geolocalisee`,
      { params: { latitude, longitude, rayonKm } }
    );
  }

  // Lister les produits disponibles
  listerProduits(page: number = 0, size: number = 20): Observable<{ data: Produit[] }> {
    return this.http.get<{ data: Produit[] }>(
      `${this.apiUrl}/marketplace/produits`,
      { params: { page, size } }
    );
  }

  // Consulter le catalogue d'un producteur
  consulterCatalogueProducteur(producteurId: number): Observable<{ data: Produit[] }> {
    return this.http.get<{ data: Produit[] }>(
      `${this.apiUrl}/marketplace/produits/producteur/${producteurId}`
    );
  }

  // Passer une commande
  passerCommande(produitId: number, quantite: number, idempotencyKey?: string): Observable<{ data: Commande }> {
    const body = {
      produitId,
      quantite,
      idempotencyKey: idempotencyKey || `cmd-${Date.now()}`
    };
    return this.http.post<{ data: Commande }>(
      `${this.apiUrl}/marketplace/commandes`,
      body
    );
  }

  // Lister les commandes de l'éleveur connecté
  listerCommandesEleveur(eleveurId: number, page: number = 0, size: number = 20): Observable<{ data: Commande[] }> {
    return this.http.get<{ data: Commande[] }>(
      `${this.apiUrl}/marketplace/commandes/eleveur/${eleveurId}`,
      { params: { page, size } }
    );
  }

  // Lister les commandes du producteur connecté
  listerCommandesProducteur(producteurId: number, page: number = 0, size: number = 20): Observable<{ data: Commande[] }> {
    return this.http.get<{ data: Commande[] }>(
      `${this.apiUrl}/marketplace/commandes/producteur/${producteurId}`,
      { params: { page, size } }
    );
  }

  // Obtenir les détails d'une commande
  obtenirCommande(commandeId: number): Observable<{ data: Commande }> {
    return this.http.get<{ data: Commande }>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}`
    );
  }

  // Confirmer une commande
  confirmerCommande(commandeId: number): Observable<{ data: Commande }> {
    return this.http.post<{ data: Commande }>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}/confirmer`,
      {}
    );
  }

  // Annuler une commande
  annulerCommande(commandeId: number, motif?: string): Observable<{ data: Commande }> {
    return this.http.post<{ data: Commande }>(
      `${this.apiUrl}/marketplace/commandes/${commandeId}/annuler`,
      {},
      { params: motif ? { motif } : {} }
    );
  }
}
