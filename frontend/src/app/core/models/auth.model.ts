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

export interface BackendUtilisateurInfo {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  statut: string;
  nomExploitation?: string;
  capaciteProduction?: number;
}

export interface UtilisateurInfo {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  statut: string;
  nomExploitation?: string;
  capaciteProduction?: number;
}
