export interface ProducteurRegisterRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  nomExploitation: string;
  capaciteProduction: number;
  latitude?: number;
  longitude?: number;
  province?: string;
  ville?: string;
}
