import { Produit } from './produit.model';
import { Producteur, Eleveur } from './utilisateur.model';

export interface Commande {
  idCommande: number;
  numeroCommande: string;
  producteur: Producteur;
  eleveur: Eleveur;
  statut: StatutCommande;
  dateCommande: string;
  lignes: LigneCommande[];
  paiement?: Paiement;
}

export interface LigneCommande {
  id?: number;
  quantite: number;
  prixUnitaireFige: number;
  produit?: Produit;
}

export enum StatutCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRME = 'CONFIRME',
  PAYE = 'PAYE',
  ANNULE = 'ANNULE',
  LIVRE = 'LIVRE'
}

export interface Paiement {
  idPaiement: number;
  commandeId: number;
  operateur: string;
  montant: number;
  referenceTransaction: string;
  datePaiement: string;
  statutPaiement: StatutPaiement;
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRME = 'CONFIRME',
  ECHOUE = 'ECHOUE',
  ANNULE = 'ANNULE'
}
