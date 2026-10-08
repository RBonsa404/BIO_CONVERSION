export interface AuthRequest {
  telephone: string;
  motDePasse: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: UtilisateurInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BackendAuthResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: BackendUtilisateurInfo;
}

export type RoleUtilisateur = 'PRODUCTEUR' | 'ELEVEUR' | 'ADMINISTRATEUR' | 'SUPER_ADMINISTRATEUR';

export type StatutUtilisateur = 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE_VALIDATION' | 'REFUSE';

/** Profil tel que renvoyé par le backend (UtilisateurResponse). */
export interface BackendUtilisateurInfo {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: RoleUtilisateur;
  statut: StatutUtilisateur;
  dateCreation?: string;
  matricule?: string;
  nomExploitation?: string;
  capaciteProduction?: number;
  typeElevage?: string;
  adresse?: string;
  ville?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}

/** Utilisateur connecté, conservé côté navigateur. */
export interface UtilisateurInfo extends Omit<BackendUtilisateurInfo, 'id'> {
  idUtilisateur: number;
}

export interface ProfilUpdateRequest {
  nom: string;
  prenom: string;
  nomExploitation?: string;
  capaciteProduction?: number;
  typeElevage?: string;
  adresse?: string;
  ville?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}
