export interface Produit {
  idProduit: number;
  nomProduit: string;
  typeProduit: string;
  prix: number;
  quantiteStock: number;
  disponibilite: Disponibilite;
  producteurId: number;
  createdAt: string;
  version: number;
}

export enum Disponibilite {
  DISPONIBLE = 'DISPONIBLE',
  INDISPONIBLE = 'INDISPONIBLE',
  RUPTURE_STOCK = 'RUPTURE_STOCK'
}
