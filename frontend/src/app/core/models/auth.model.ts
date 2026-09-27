export interface AuthRequest {
  telephone: string;
  motDePasse: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: UtilisateurInfo;
}

export interface UtilisateurInfo {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  statut: string;
}

export interface ProducteurRegisterRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  nomExploitation: string;
  capaciteProduction: number;
  ville: string;
  province: string;
  latitude?: number;
  longitude?: number;
}

export interface EleveurRegisterRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  typeElevage: string;
  ville: string;
  province: string;
  latitude?: number;
  longitude?: number;
}
