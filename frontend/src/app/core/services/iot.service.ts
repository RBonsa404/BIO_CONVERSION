import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

export interface Capteur {
  idCapteur: number;
  codeIdentifiant: string;
  typeCapteur: string;
  estActif: boolean;
  temperature: number | null;
  humidite: number | null;
  dateMesure: string | null;
  seuilTemperatureMax: number | null;
  seuilHumiditeMax: number | null;
  enAlerte: boolean;
}

export interface CapteurRequest {
  codeIdentifiant: string;
  typeCapteur: string;
  seuilTemperatureMax?: number;
  seuilHumiditeMax?: number;
}

export interface AlerteIot {
  idAlerte: number;
  codeCapteur: string;
  typeAlerte: string;
  message: string;
  dateAlerte: string;
  seuil: number;
}

@Injectable({
  providedIn: 'root'
})
export class IotService {
  private apiUrl = `${environment.apiUrl}/iot`;

  constructor(private http: HttpClient) {}

  listerCapteurs(): Observable<ApiResponse<Capteur[]>> {
    return this.http.get<ApiResponse<Capteur[]>>(`${this.apiUrl}/capteurs`);
  }

  enregistrerCapteur(capteur: CapteurRequest): Observable<ApiResponse<Capteur>> {
    return this.http.post<ApiResponse<Capteur>>(`${this.apiUrl}/capteurs`, capteur);
  }

  changerStatut(capteurId: number, actif: boolean): Observable<ApiResponse<Capteur>> {
    return this.http.patch<ApiResponse<Capteur>>(
      `${this.apiUrl}/capteurs/${capteurId}/statut`,
      null,
      { params: { actif } }
    );
  }

  listerAlertes(limite = 20): Observable<ApiResponse<AlerteIot[]>> {
    return this.http.get<ApiResponse<AlerteIot[]>>(`${this.apiUrl}/alertes`, { params: { limite } });
  }
}
