export interface Utilisateur {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  telephone: string;
  statut: StatutUtilisateur;
  createdAt: string;
  updatedAt: string;
}

export enum StatutUtilisateur {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  BLOQUE = 'BLOQUE'
}

export interface Producteur extends Utilisateur {
  nomExploitation: string;
  capaciteProduction: number;
  localisation?: Localisation;
  dtype: 'Producteur';
}

export interface Eleveur extends Utilisateur {
  typeElevage: string;
  localisation?: Localisation;
  dtype: 'Eleveur';
}

export interface Administrateur extends Utilisateur {
  dtype: 'Administrateur';
}

export interface Localisation {
  id?: number;
  latitude: number;
  longitude: number;
  ville: string;
  province: string;
  createdAt?: string;
}
