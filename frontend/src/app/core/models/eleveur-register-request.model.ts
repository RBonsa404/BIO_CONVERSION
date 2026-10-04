export interface EleveurRegisterRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  typeElevage: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  province?: string;
  ville?: string;
}
