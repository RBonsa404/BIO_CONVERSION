import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { PageResponse, ProducteurProfile } from './marketplace.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listerProducteursEnAttente(page = 0, size = 20): Observable<ApiResponse<PageResponse<ProducteurProfile>>> {
    return this.http.get<ApiResponse<PageResponse<ProducteurProfile>>>(
      `${this.apiUrl}/api/v1/producteurs/en-attente`,
      { params: { page, size } }
    );
  }

  validerProducteur(producteurId: number, approuve: boolean): Observable<ApiResponse<ProducteurProfile>> {
    return this.http.put<ApiResponse<ProducteurProfile>>(
      `${this.apiUrl}/api/v1/producteurs/${producteurId}/valider`,
      null,
      { params: { approuve } }
    );
  }
}
